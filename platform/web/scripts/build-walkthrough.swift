import AppKit
import AVFoundation
import CoreImage

struct Scene {
  let imageName: String
  let step: String
  let title: String
  let chineseTitle: String
  let body: String
  let duration: Double
  let highlight: CGRect
}

let scenes = [
  Scene(imageName: "01-hero.png", step: "INTERVIEWTHREAD", title: "Prepare with real evidence", chineseTitle: "用真實證據準備面試", body: "Resume + job description → truthful interview practice", duration: 5, highlight: CGRect(x: 355, y: 305, width: 270, height: 65)),
  Scene(imageName: "02-workspace.png", step: "STEP 1", title: "Follow one clear path", chineseTitle: "只要跟著四個步驟", body: "Resume → job post → stories → mock interview", duration: 5, highlight: CGRect(x: 245, y: 215, width: 745, height: 80)),
  Scene(imageName: "03-resume-uploaded.png", step: "STEP 2", title: "Upload your resume", chineseTitle: "上傳履歷或貼上真實經驗", body: "Documents are parsed locally before you choose what to analyze", duration: 5, highlight: CGRect(x: 330, y: 275, width: 430, height: 92)),
  Scene(imageName: "04-ready-to-analyze.png", step: "STEP 3", title: "Set the real interview round", chineseTitle: "設定面試階段、時間與長度", body: "Timing changes the depth and number of predicted questions", duration: 6, highlight: CGRect(x: 735, y: 278, width: 488, height: 82)),
  Scene(imageName: "05-analysis.png", step: "STEP 4", title: "See proof and real gaps", chineseTitle: "看見強項，也看見真正缺口", body: "Every score is explained instead of hidden behind a match number", duration: 6, highlight: CGRect(x: 975, y: 452, width: 245, height: 142)),
  Scene(imageName: "06-proof-pack.png", step: "YOUR RESULT", title: "Build stories you can defend", chineseTitle: "把證據變成經得起追問的故事", body: "The proof pack separates verified strengths from missing evidence", duration: 6, highlight: CGRect(x: 330, y: 335, width: 890, height: 155)),
  Scene(imageName: "07-predicted-questions.png", step: "YOUR PLAN", title: "Prepare the most likely questions", chineseTitle: "先練這場面試最可能問的題目", body: "Questions are ranked for this role, round, duration, and evidence", duration: 6, highlight: CGRect(x: 795, y: 175, width: 430, height: 475)),
  Scene(imageName: "08-mock-interview.png", step: "STEP 5", title: "Choose who interviews you", chineseTitle: "選擇面試官角色與練習模式", body: "HR, hiring manager, technical, case, executive, and more", duration: 5, highlight: CGRect(x: 330, y: 162, width: 900, height: 115)),
  Scene(imageName: "09-interview-started.png", step: "PRACTICE", title: "Answer by voice or text", chineseTitle: "用語音或文字回答，追問會逐步深入", body: "The interviewer follows your answer instead of repeating a script", duration: 5, highlight: CGRect(x: 335, y: 330, width: 555, height: 160)),
  Scene(imageName: "10-feedback.png", step: "IMPROVE", title: "Improve, then try the next question", chineseTitle: "看具體回饋，再練下一題", body: "Strengths and missing evidence stay visible after every response", duration: 6, highlight: CGRect(x: 645, y: 315, width: 340, height: 105)),
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

func makeBaseSlide(for scene: Scene, index: Int) throws -> CGImage {
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

  let serifFont = NSFont(name: "Source Serif 4", size: 31) ?? NSFont(name: "Georgia", size: 31) ?? .systemFont(ofSize: 31, weight: .bold)
  let chineseFont = NSFont(name: "Noto Serif TC", size: 21) ?? NSFont(name: "Songti TC", size: 21) ?? .systemFont(ofSize: 21, weight: .semibold)
  let bodyFont = NSFont(name: "Source Serif 4", size: 15) ?? NSFont.systemFont(ofSize: 15, weight: .medium)
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
    in: NSRect(x: 58, y: 91, width: 760, height: 42),
    withAttributes: [
      .font: serifFont,
      .foregroundColor: NSColor.white,
      .paragraphStyle: paragraph,
    ]
  )
  NSString(string: scene.chineseTitle).draw(
    in: NSRect(x: 58, y: 63, width: 820, height: 30),
    withAttributes: [
      .font: chineseFont,
      .foregroundColor: NSColor(calibratedRed: 0.78, green: 0.87, blue: 0.92, alpha: 1),
      .paragraphStyle: paragraph,
    ]
  )
  NSString(string: scene.body).draw(
    in: NSRect(x: 58, y: 39, width: 960, height: 24),
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

func eased(_ value: CGFloat) -> CGFloat {
  let t = min(1, max(0, value))
  return 1 - pow(1 - t, 3)
}

func makeFrame(base: CGImage, scene: Scene, elapsed: Double) throws -> CGImage {
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
  ), let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 11)
  }

  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = graphicsContext
  let baseImage = NSImage(cgImage: base, size: NSSize(width: width, height: height))
  baseImage.draw(in: NSRect(x: 0, y: 0, width: width, height: height))

  let circleProgress = eased(CGFloat((elapsed - 0.55) / 0.8))
  if circleProgress > 0 {
    for layer in 0..<3 {
      let inset = CGFloat(layer - 1) * 3
      let jitterX = CGFloat(layer - 1) * 1.8
      let path = NSBezierPath(ovalIn: scene.highlight.insetBy(dx: inset, dy: inset).offsetBy(dx: jitterX, dy: -jitterX))
      path.lineWidth = layer == 1 ? 5.5 : 2.2
      NSColor(calibratedRed: 0.25, green: 0.56, blue: 0.72, alpha: (layer == 1 ? 0.9 : 0.42) * circleProgress).setStroke()
      path.stroke()
    }
  }

  let target = CGPoint(x: scene.highlight.maxX - 18, y: scene.highlight.minY + 12)
  let start = CGPoint(x: min(CGFloat(width - 40), target.x + 155), y: min(CGFloat(height - 35), target.y + 105))
  let travel = eased(CGFloat(elapsed / 1.15))
  let cursor = CGPoint(x: start.x + (target.x - start.x) * travel, y: start.y + (target.y - start.y) * travel)

  let rippleTime = elapsed - 1.12
  if rippleTime >= 0 && rippleTime <= 1.05 {
    let ripple = CGFloat(rippleTime / 1.05)
    let radius = 12 + 34 * ripple
    let ring = NSBezierPath(ovalIn: CGRect(x: cursor.x - radius, y: cursor.y - radius, width: radius * 2, height: radius * 2))
    ring.lineWidth = 4
    NSColor(calibratedRed: 0.34, green: 0.68, blue: 0.82, alpha: 0.8 * (1 - ripple)).setStroke()
    ring.stroke()
  }

  let pointer = NSBezierPath()
  pointer.move(to: cursor)
  pointer.line(to: CGPoint(x: cursor.x + 9, y: cursor.y - 28))
  pointer.line(to: CGPoint(x: cursor.x + 16, y: cursor.y - 17))
  pointer.line(to: CGPoint(x: cursor.x + 28, y: cursor.y - 19))
  pointer.close()
  NSColor.white.setFill()
  pointer.fill()
  pointer.lineWidth = 3.2
  NSColor(calibratedRed: 0.08, green: 0.13, blue: 0.17, alpha: 0.96).setStroke()
  pointer.stroke()

  NSGraphicsContext.restoreGraphicsState()
  guard let frame = bitmap.cgImage else {
    throw NSError(domain: "InterviewThreadWalkthrough", code: 12)
  }
  return frame
}

try? FileManager.default.removeItem(at: outputURL)
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 8_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
  ],
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
  let baseImage = try makeBaseSlide(for: scene, index: sceneIndex)
  let frameCount = Int(scene.duration * Double(fps))
  for localFrame in 0..<frameCount {
    let cgImage = try autoreleasepool {
      try makeFrame(base: baseImage, scene: scene, elapsed: Double(localFrame) / Double(fps))
    }
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
