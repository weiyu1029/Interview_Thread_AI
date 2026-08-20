#import <AppKit/AppKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreImage/CoreImage.h>

typedef struct {
  __unsafe_unretained NSString *imageName;
  double duration;
  CGRect highlight;
} WalkthroughScene;

static const NSInteger CanvasWidth = 1280;
static const NSInteger CanvasHeight = 720;
static const int32_t FramesPerSecond = 15;

static CGFloat easeOut(CGFloat value) {
  CGFloat t = MIN(1, MAX(0, value));
  return 1 - pow(1 - t, 3);
}

static CGImageRef createBaseImage(NSURL *directory, WalkthroughScene scene, NSError **error) {
  NSURL *sourceURL = [directory URLByAppendingPathComponent:scene.imageName];
  NSImage *source = [[NSImage alloc] initWithContentsOfURL:sourceURL];
  if (!source) {
    if (error) *error = [NSError errorWithDomain:@"InterviewThreadWalkthrough" code:1 userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"Cannot read %@", sourceURL.path]}];
    return NULL;
  }
  NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
    initWithBitmapDataPlanes:NULL
    pixelsWide:CanvasWidth
    pixelsHigh:CanvasHeight
    bitsPerSample:8
    samplesPerPixel:4
    hasAlpha:YES
    isPlanar:NO
    colorSpaceName:NSDeviceRGBColorSpace
    bytesPerRow:0
    bitsPerPixel:0];
  NSGraphicsContext *graphics = [NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap];
  [NSGraphicsContext saveGraphicsState];
  [NSGraphicsContext setCurrentContext:graphics];
  [[NSColor colorWithCalibratedWhite:0.96 alpha:1] setFill];
  NSRectFill(NSMakeRect(0, 0, CanvasWidth, CanvasHeight));
  [source drawInRect:NSMakeRect(0, 0, CanvasWidth, CanvasHeight)
            fromRect:NSZeroRect
           operation:NSCompositingOperationSourceOver
            fraction:1];
  [NSGraphicsContext restoreGraphicsState];
  return CGImageCreateCopy(bitmap.CGImage);
}

static CGImageRef createFrame(CGImageRef base, WalkthroughScene scene, double elapsed) {
  NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
    initWithBitmapDataPlanes:NULL
    pixelsWide:CanvasWidth
    pixelsHigh:CanvasHeight
    bitsPerSample:8
    samplesPerPixel:4
    hasAlpha:YES
    isPlanar:NO
    colorSpaceName:NSDeviceRGBColorSpace
    bytesPerRow:0
    bitsPerPixel:0];
  NSGraphicsContext *graphics = [NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap];
  [NSGraphicsContext saveGraphicsState];
  [NSGraphicsContext setCurrentContext:graphics];
  NSImage *baseImage = [[NSImage alloc] initWithCGImage:base size:NSMakeSize(CanvasWidth, CanvasHeight)];
  [baseImage drawInRect:NSMakeRect(0, 0, CanvasWidth, CanvasHeight)];

  CGFloat circleProgress = easeOut((elapsed - 0.55) / 0.8);
  if (circleProgress > 0) {
    for (NSInteger layer = 0; layer < 3; layer += 1) {
      CGFloat inset = (layer - 1) * 3;
      CGFloat jitter = (layer - 1) * 1.8;
      CGRect rect = CGRectOffset(CGRectInset(scene.highlight, inset, inset), jitter, -jitter);
      NSBezierPath *path = [NSBezierPath bezierPathWithOvalInRect:rect];
      path.lineWidth = layer == 1 ? 5.5 : 2.2;
      [[NSColor colorWithCalibratedRed:0.25 green:0.56 blue:0.72 alpha:(layer == 1 ? 0.9 : 0.42) * circleProgress] setStroke];
      [path stroke];
    }
  }

  CGPoint target = CGPointMake(CGRectGetMaxX(scene.highlight) - 18, CGRectGetMinY(scene.highlight) + 12);
  CGPoint start = CGPointMake(MIN(CanvasWidth - 40, target.x + 155), MIN(CanvasHeight - 35, target.y + 105));
  CGFloat travel = easeOut(elapsed / 1.15);
  CGPoint cursor = CGPointMake(start.x + (target.x - start.x) * travel, start.y + (target.y - start.y) * travel);
  double rippleTime = elapsed - 1.12;
  if (rippleTime >= 0 && rippleTime <= 1.05) {
    CGFloat ripple = rippleTime / 1.05;
    CGFloat radius = 12 + 34 * ripple;
    NSBezierPath *ring = [NSBezierPath bezierPathWithOvalInRect:NSMakeRect(cursor.x - radius, cursor.y - radius, radius * 2, radius * 2)];
    ring.lineWidth = 4;
    [[NSColor colorWithCalibratedRed:0.34 green:0.68 blue:0.82 alpha:0.8 * (1 - ripple)] setStroke];
    [ring stroke];
  }

  NSBezierPath *pointer = [NSBezierPath bezierPath];
  [pointer moveToPoint:cursor];
  [pointer lineToPoint:NSMakePoint(cursor.x + 9, cursor.y - 28)];
  [pointer lineToPoint:NSMakePoint(cursor.x + 16, cursor.y - 17)];
  [pointer lineToPoint:NSMakePoint(cursor.x + 28, cursor.y - 19)];
  [pointer closePath];
  [NSColor.whiteColor setFill];
  [pointer fill];
  pointer.lineWidth = 3.2;
  [[NSColor colorWithCalibratedRed:0.08 green:0.13 blue:0.17 alpha:0.96] setStroke];
  [pointer stroke];

  [NSGraphicsContext restoreGraphicsState];
  return CGImageCreateCopy(bitmap.CGImage);
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 3) {
      fprintf(stderr, "Usage: build-walkthrough <screenshots-dir> <output.mp4>\n");
      return 2;
    }
    WalkthroughScene scenes[] = {
      {@"01-hero.png", 5, {{355, 305}, {270, 65}}},
      {@"02-workspace.png", 5, {{245, 215}, {745, 80}}},
      {@"03-resume-uploaded.png", 5, {{330, 275}, {430, 92}}},
      {@"04-ready-to-analyze.png", 6, {{735, 278}, {488, 82}}},
      {@"05-analysis.png", 6, {{975, 452}, {245, 142}}},
      {@"06-proof-pack.png", 6, {{330, 335}, {890, 155}}},
      {@"07-predicted-questions.png", 6, {{795, 175}, {430, 475}}},
      {@"08-mock-interview.png", 5, {{330, 162}, {900, 115}}},
      {@"09-interview-started.png", 5, {{335, 330}, {555, 160}}},
      {@"10-feedback.png", 6, {{645, 315}, {340, 105}}},
    };
    const NSInteger sceneCount = sizeof(scenes) / sizeof(scenes[0]);
    NSURL *directory = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]] isDirectory:YES];
    NSURL *outputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[2]]];
    [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

    NSError *error = nil;
    AVAssetWriter *writer = [AVAssetWriter assetWriterWithURL:outputURL fileType:AVFileTypeQuickTimeMovie error:&error];
    if (!writer) {
      fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
      return 3;
    }
    NSDictionary *settings = @{
      AVVideoCodecKey: AVVideoCodecTypeJPEG,
      AVVideoWidthKey: @(CanvasWidth),
      AVVideoHeightKey: @(CanvasHeight),
    };
    AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo outputSettings:settings];
    input.expectsMediaDataInRealTime = NO;
    AVAssetWriterInputPixelBufferAdaptor *adaptor = [AVAssetWriterInputPixelBufferAdaptor
      assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
      sourcePixelBufferAttributes:@{
        (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
        (NSString *)kCVPixelBufferWidthKey: @(CanvasWidth),
        (NSString *)kCVPixelBufferHeightKey: @(CanvasHeight),
        (NSString *)kCVPixelBufferIOSurfacePropertiesKey: @{},
      }];
    [writer addInput:input];
    if (![writer startWriting]) {
      fprintf(stderr, "%s\n", writer.error.localizedDescription.UTF8String);
      return 4;
    }
    [writer startSessionAtSourceTime:kCMTimeZero];
    CIContext *ciContext = [CIContext contextWithOptions:@{kCIContextUseSoftwareRenderer: @NO}];
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    int64_t frameIndex = 0;

    for (NSInteger sceneIndex = 0; sceneIndex < sceneCount; sceneIndex += 1) {
      CGImageRef base = createBaseImage(directory, scenes[sceneIndex], &error);
      if (!base) {
        fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
        return 4;
      }
      NSInteger frameCount = (NSInteger)(scenes[sceneIndex].duration * FramesPerSecond);
      for (NSInteger localFrame = 0; localFrame < frameCount; localFrame += 1) {
        @autoreleasepool {
          while (!input.readyForMoreMediaData) [NSThread sleepForTimeInterval:0.004];
          CVPixelBufferRef pixelBuffer = NULL;
          CVReturn status = adaptor.pixelBufferPool
            ? CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &pixelBuffer)
            : CVPixelBufferCreate(
                NULL,
                CanvasWidth,
                CanvasHeight,
                kCVPixelFormatType_32BGRA,
                (__bridge CFDictionaryRef)@{
                  (NSString *)kCVPixelBufferCGImageCompatibilityKey: @YES,
                  (NSString *)kCVPixelBufferCGBitmapContextCompatibilityKey: @YES,
                },
                &pixelBuffer);
          if (status != kCVReturnSuccess || !pixelBuffer) {
            fprintf(stderr, "Cannot allocate pixel buffer: %d\n", status);
            return 5;
          }
          CGImageRef frame = createFrame(base, scenes[sceneIndex], (double)localFrame / FramesPerSecond);
          CIImage *ciImage = [CIImage imageWithCGImage:frame];
          [ciContext render:ciImage toCVPixelBuffer:pixelBuffer bounds:CGRectMake(0, 0, CanvasWidth, CanvasHeight) colorSpace:colorSpace];
          if (![adaptor appendPixelBuffer:pixelBuffer withPresentationTime:CMTimeMake(frameIndex, FramesPerSecond)]) {
            fprintf(stderr, "%s\n", writer.error.localizedDescription.UTF8String);
            return 6;
          }
          CGImageRelease(frame);
          CVPixelBufferRelease(pixelBuffer);
          frameIndex += 1;
        }
      }
      CGImageRelease(base);
    }

    CGColorSpaceRelease(colorSpace);
    [input markAsFinished];
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    if (writer.status != AVAssetWriterStatusCompleted) {
      fprintf(stderr, "%s\n", writer.error.localizedDescription.UTF8String);
      return 7;
    }
    printf("Created %s with %lld silent frames.\n", outputURL.path.UTF8String, frameIndex);
  }
  return 0;
}
