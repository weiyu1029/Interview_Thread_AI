import AppKit
import AVFoundation
import CoreImage

struct Scene {
  let imageName: String
  let step: String
  let title: String
  let body: String
  let duration: Double
}

let scenes = [
  Scene(imageName: "01-hero.png", step: "INTERVIEWTHREAD", title: "Prepare for the job you want", body: "Use your real resume and the real job description—never invented achievements.", duration: 5),
  Scene(imageName: "02-workspace.png", step: "STEP 1", title: "Open your Interview Proof Pack", body: "Start with the two documents that matter: your resume and the job description.", duration: 5),
  Scene(imageName: "03-resume-uploaded.png", step: "STEP 2", title: "Upload your resume", body: "Choose a local file or paste the experience you can truthfully discuss.", duration: 5),
  Scene(imageName: "04-ready-to-analyze.png", step: "STEP 3", title: "Add the job description", body: "Set the interview stage and duration so the question plan fits the real round.", duration: 6),
  Scene(imageName: "05-analysis.png", step: "STEP 4", title: "Generate your evidence map", body: "See strong proof, partial proof, and real gaps—with a transparent score.", duration: 6),
  Scene(imageName: "06-proof-pack.png", step: "YOUR RESULT", title: "Build defensible interview stories", body: "Your strongest evidence becomes stories you can explain and defend under follow-up.", duration: 6),
  Scene(imageName: "07-predicted-questions.png", step: "YOUR PLAN", title: "Prepare the questions most likely to come next", body: "Questions adapt to the role, interview stage, duration, evidence, and visible gaps.", duration: 6),
  Scene(imageName: "08-mock-interview.png", step: "STEP 5", title: "Enter the Mock Interview Studio", body: "Choose the interviewer role and practice with evidence-grounded follow-ups.", duration: 5),
  Scene(imageName: "09-interview-started.png", step: "PRACTICE", title: "Answer by typing or voice", body: "The interviewer follows a clear story spine instead of repeating generic questions.", duration: 5),
  Scene(imageName: "10-feedback.png", step: "IMPROVE", title: "Get specific coaching and the next question", body: "See what was strong, what is missing, and exactly what to improve before the real interview.", duration: 6),
]

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: build-walkthrough.swift <screenshots-dir> <output.mp4>\n", stderr)
  exit(2)
}

let screenshotsDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let width = 1280
let height = 720
let fps: Int32 = 15
let ciContext = CIContext(options: [.useSoftwareRenderer: false])
let colorSpace = CGColorSpaceCreateDeviceRGB()

func roundedPath(_ rect: CGRect, radius: CGFloat) -> NSBezierPath {
  NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
}

func makeSlide(for scene: Scene, index: Int) throws -> CGImage {
  let sourceURL = screenshotsDirectory.appendingPathComponent(scene.imageName)
  guard let sourceImage = NSImage(contentsOf: sourceURL) else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cannot read \(sourceURL.path)"])
  }
  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width,
    pixelsHigh: height,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ) else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 2)
  }

  NSGraphicsContext.saveGraphicsState()
  guard let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 3)
  }
  NSGraphicsContext.current = graphicsContext

  NSColor(calibratedWhite: 0.96, alpha: 1).setFill()
  NSRect(x: 0, y: 0, width: width, height: height).fill()
  sourceImage.draw(in: NSRect(x: 0, y: 0, width: width, height: height), from: .zero, operation: .sourceOver, fraction: 1)

  let overlayRect = NSRect(x: 26, y: 24, width: width - 52, height: 140)
  NSColor(calibratedRed: 0.11, green: 0.15, blue: 0.19, alpha: 0.95).setFill()
  roundedPath(overlayRect, radius: 20).fill()

  let serifFont = NSFont(name: "Source Serif 4", size: 34) ?? NSFont(name: "Georgia", size: 34) ?? .systemFont(ofSize: 34, weight: .bold)
  let bodyFont = NSFont.systemFont(ofSize: 19, weight: .medium)
  let labelFont = NSFont.systemFont(ofSize: 13, weight: .bold)

  let paragraph = NSMutableParagraphStyle()
  paragraph.lineBreakMode = .byTruncatingTail
  paragraph.alignment = .left

  NSString(string: scene.step).draw(
    in: NSRect(x: 58, y: 132, width: 250, height: 22),
    withAttributes: [
      .font: labelFont,
      .foregroundColor: NSColor(calibratedRed: 0.72, green: 0.83, blue: 0.89, alpha: 1),
      .kern: 1.5,
      .paragraphStyle: paragraph,
    ]
  )
  NSString(string: scene.title).draw(
    in: NSRect(x: 58, y: 79, width: 700, height: 50),
    withAttributes: [
      .font: serifFont,
      .foregroundColor: NSColor.white,
      .paragraphStyle: paragraph,
    ]
  )
  NSString(string: scene.body).draw(
    in: NSRect(x: 58, y: 46, width: 930, height: 30),
    withAttributes: [
      .font: bodyFont,
      .foregroundColor: NSColor(calibratedWhite: 0.86, alpha: 1),
      .paragraphStyle: paragraph,
    ]
  )

  let counter = String(format: "%02d / %02d", index + 1, scenes.count)
  let counterParagraph = NSMutableParagraphStyle()
  counterParagraph.alignment = .right
  NSString(string: counter).draw(
    in: NSRect(x: width - 190, y: 78, width: 120, height: 28),
    withAttributes: [
      .font: NSFont.monospacedDigitSystemFont(ofSize: 16, weight: .semibold),
      .foregroundColor: NSColor(calibratedWhite: 0.82, alpha: 1),
      .paragraphStyle: counterParagraph,
    ]
  )

  NSGraphicsContext.restoreGraphicsState()
  guard let cgImage = bitmap.cgImage else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 4)
  }
  return cgImage
}

try? FileManager.default.removeItem(at: outputURL)
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mov)
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.proRes422,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
  ]
)
guard writer.canAdd(input) else {
  throw NSError(domain: "InterviewThreadWalkthrough", code: 5)
}
writer.add(input)
guard writer.startWriting() else {
  throw writer.error ?? NSError(domain: "InterviewThreadWalkthrough", code: 6)
}
writer.startSession(atSourceTime: .zero)

var frameIndex: Int64 = 0
for (sceneIndex, scene) in scenes.enumerated() {
  let cgImage = try makeSlide(for: scene, index: sceneIndex)
  let frameCount = Int(scene.duration * Double(fps))
  for _ in 0..<frameCount {
    while !input.isReadyForMoreMediaData {
      Thread.sleep(forTimeInterval: 0.004)
    }
    guard let pool = adaptor.pixelBufferPool else {
      throw NSError(domain: "InterviewThreadWalkthrough", code: 7)
    }
    var maybeBuffer: CVPixelBuffer?
    guard CVPixelBufferPoolCreatePixelBuffer(nil, pool, &maybeBuffer) == kCVReturnSuccess,
          let pixelBuffer = maybeBuffer else {
      throw NSError(domain: "InterviewThreadWalkthrough", code: 8)
    }
    ciContext.render(
      CIImage(cgImage: cgImage),
      to: pixelBuffer,
      bounds: CGRect(x: 0, y: 0, width: width, height: height),
      colorSpace: colorSpace
    )
    let presentationTime = CMTime(value: frameIndex, timescale: fps)
    guard adaptor.append(pixelBuffer, withPresentationTime: presentationTime) else {
      throw writer.error ?? NSError(domain: "InterviewThreadWalkthrough", code: 9)
    }
    frameIndex += 1
  }
}

input.markAsFinished()
await writer.finishWriting()
guard writer.status == .completed else {
  throw writer.error ?? NSError(domain: "InterviewThreadWalkthrough", code: 10)
}
print("Created \(outputURL.path) with \(frameIndex) frames at \(fps) fps")
