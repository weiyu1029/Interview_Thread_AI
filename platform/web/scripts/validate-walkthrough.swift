import AppKit
import AVFoundation
import Foundation

guard CommandLine.arguments.count >= 2 else {
  fputs("Usage: validate-walkthrough.swift <video.mp4> [frames-dir]\n", stderr)
  exit(2)
}

let videoURL = URL(fileURLWithPath: CommandLine.arguments[1])
let framesDirectory = CommandLine.arguments.count >= 3
  ? URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
  : nil
let asset = AVURLAsset(url: videoURL)
let playable = try await asset.load(.isPlayable)
let duration = try await asset.load(.duration)
let videoTracks = try await asset.loadTracks(withMediaType: .video)
let audioTracks = try await asset.loadTracks(withMediaType: .audio)

guard playable, let videoTrack = videoTracks.first, !audioTracks.isEmpty else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 30, userInfo: [NSLocalizedDescriptionKey: "The final asset must be playable and include video plus audio"])
}

let naturalSize = try await videoTrack.load(.naturalSize)
let transform = try await videoTrack.load(.preferredTransform)
let transformed = naturalSize.applying(transform)
let width = abs(transformed.width)
let height = abs(transformed.height)
let seconds = duration.seconds

guard abs(seconds - 55) < 0.25, Int(width.rounded()) == 1280, Int(height.rounded()) == 720 else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 31, userInfo: [NSLocalizedDescriptionKey: "Expected 55 seconds at 1280×720, got \(seconds) seconds at \(width)×\(height)"])
}

print("playable=true duration=\(String(format: "%.3f", seconds)) size=\(Int(width))x\(Int(height)) video_tracks=\(videoTracks.count) audio_tracks=\(audioTracks.count)")

if let framesDirectory {
  try FileManager.default.createDirectory(at: framesDirectory, withIntermediateDirectories: true)
  let generator = AVAssetImageGenerator(asset: asset)
  generator.appliesPreferredTrackTransform = true
  generator.requestedTimeToleranceBefore = .zero
  generator.requestedTimeToleranceAfter = .zero
  let checks: [Double] = [1.35, 12.0, 23.0, 35.0, 41.0, 51.0]
  for (index, seconds) in checks.enumerated() {
    let image = try generator.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 600), actualTime: nil)
    let bitmap = NSBitmapImageRep(cgImage: image)
    guard let png = bitmap.representation(using: .png, properties: [:]) else {
      throw NSError(domain: "InterviewThreadWalkthrough", code: 32)
    }
    try png.write(to: framesDirectory.appendingPathComponent(String(format: "frame-%02d.png", index + 1)))
  }
  print("frames=\(framesDirectory.path)")
}
