import AVFoundation
import Foundation

guard CommandLine.arguments.count == 4 else {
  fputs("Usage: assemble-walkthrough.swift <silent-video.mov> <audio-dir> <output.mp4>\n", stderr)
  exit(2)
}

let videoURL = URL(fileURLWithPath: CommandLine.arguments[1])
let audioDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let outputURL = URL(fileURLWithPath: CommandLine.arguments[3])
let sceneDurations: [Double] = [5, 5, 5, 6, 6, 6, 6, 5, 5, 6]

let composition = AVMutableComposition()
let videoAsset = AVURLAsset(url: videoURL)
let videoDuration = try await videoAsset.load(.duration)
guard let sourceVideoTrack = try await videoAsset.loadTracks(withMediaType: .video).first,
      let videoTrack = composition.addMutableTrack(
        withMediaType: .video,
        preferredTrackID: kCMPersistentTrackID_Invalid
      ) else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 20, userInfo: [NSLocalizedDescriptionKey: "Video track unavailable"])
}
try videoTrack.insertTimeRange(
  CMTimeRange(start: .zero, duration: videoDuration),
  of: sourceVideoTrack,
  at: .zero
)
videoTrack.preferredTransform = try await sourceVideoTrack.load(.preferredTransform)

guard let audioTrack = composition.addMutableTrack(
  withMediaType: .audio,
  preferredTrackID: kCMPersistentTrackID_Invalid
) else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 21, userInfo: [NSLocalizedDescriptionKey: "Audio track unavailable"])
}

var sceneStart = CMTime.zero
for (index, sceneDuration) in sceneDurations.enumerated() {
  let number = String(format: "%02d", index + 1)
  let englishURL = audioDirectory.appendingPathComponent("\(number)-en.aiff")
  let chineseURL = audioDirectory.appendingPathComponent("\(number)-zh-TW.aiff")
  let englishAsset = AVURLAsset(url: englishURL)
  let chineseAsset = AVURLAsset(url: chineseURL)
  guard let englishTrack = try await englishAsset.loadTracks(withMediaType: .audio).first,
        let chineseTrack = try await chineseAsset.loadTracks(withMediaType: .audio).first else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 22, userInfo: [NSLocalizedDescriptionKey: "Narration clip unavailable for scene \(number)"])
  }

  let englishDuration = try await englishAsset.load(.duration)
  let chineseDuration = try await chineseAsset.load(.duration)
  let sceneEnd = CMTimeAdd(sceneStart, CMTime(seconds: sceneDuration, preferredTimescale: 600))
  let englishStart = CMTimeAdd(sceneStart, CMTime(seconds: 0.2, preferredTimescale: 600))
  let chineseStart = CMTimeAdd(englishStart, CMTimeAdd(englishDuration, CMTime(seconds: 0.08, preferredTimescale: 600)))
  let maximumChineseDuration = CMTimeSubtract(CMTimeSubtract(sceneEnd, CMTime(seconds: 0.15, preferredTimescale: 600)), chineseStart)
  let insertedChineseDuration = CMTimeCompare(chineseDuration, maximumChineseDuration) <= 0 ? chineseDuration : maximumChineseDuration

  try audioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: englishDuration), of: englishTrack, at: englishStart)
  if CMTimeCompare(insertedChineseDuration, .zero) > 0 {
    try audioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: insertedChineseDuration), of: chineseTrack, at: chineseStart)
  }
  sceneStart = sceneEnd
}

try? FileManager.default.removeItem(at: outputURL)
guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPreset1280x720) else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 23, userInfo: [NSLocalizedDescriptionKey: "MP4 exporter unavailable"])
}
exporter.shouldOptimizeForNetworkUse = true
try await exporter.export(to: outputURL, as: .mp4)
print("Created \(outputURL.path) with bilingual narration")

