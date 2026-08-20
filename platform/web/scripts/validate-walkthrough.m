#import <AVFoundation/AVFoundation.h>

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 2) {
      fprintf(stderr, "Usage: validate-walkthrough <video.mp4>\n");
      return 2;
    }
    NSURL *url = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:url options:nil];
    NSArray<AVAssetTrack *> *videoTracks = [asset tracksWithMediaType:AVMediaTypeVideo];
    NSArray<AVAssetTrack *> *audioTracks = [asset tracksWithMediaType:AVMediaTypeAudio];
    AVAssetTrack *video = videoTracks.firstObject;
    if (!video || audioTracks.count != 0) {
      fprintf(stderr, "Expected one visual track and no embedded narration.\n");
      return 3;
    }
    CGSize transformed = CGSizeApplyAffineTransform(video.naturalSize, video.preferredTransform);
    NSInteger width = llround(fabs(transformed.width));
    NSInteger height = llround(fabs(transformed.height));
    double seconds = CMTimeGetSeconds(asset.duration);
    if (fabs(seconds - 55) >= 0.25 || width != 1280 || height != 720) {
      fprintf(stderr, "Expected 55 seconds at 1280x720; got %.3f seconds at %ldx%ld.\n", seconds, (long)width, (long)height);
      return 4;
    }
    printf("playable=true duration=%.3f size=%ldx%ld video_tracks=%ld audio_tracks=%ld\n", seconds, (long)width, (long)height, (long)videoTracks.count, (long)audioTracks.count);
  }
  return 0;
}

