//
//  AudioManager.m
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 7/22/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import "AudioManager.h"
@import AVFoundation;
@import MediaPlayer;

@implementation AudioManager

@synthesize bridge = _bridge;

- (AudioManager *)init
{
  self = [super init];
  if (self) {
    self.mediaUrl = @"";
    self.audioPlayer = [[STKAudioPlayer alloc] initWithOptions:(STKAudioPlayerOptions){ .flushQueueOnSeek = YES, .readBufferSize = 64 * 1024 }];
    [self.audioPlayer setDelegate:self];
    [self setSharedAudioSessionCategory];
    [self registerAudioInterruptionNotifications];
    [self registerRemoteControlEvents];
  }

  return self;
}

- (void)dealloc
{
  [self unregisterAudioInterruptionNotifications];
  [self.audioPlayer setDelegate:nil];
}


#pragma mark - Pubic API


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(play:(NSString *)uri)
{
  if (!self.audioPlayer) {
    return;
  }
  self.mediaUrl = uri;
  [self.audioPlayer play:uri];
  /*
  if (self.audioPlayer.state == STKAudioPlayerStatePaused) {
    [self.audioPlayer resume];
  } else {
    [self.audioPlayer play:uri];
  }
   */
}

RCT_EXPORT_METHOD(pause)
{
  if (!self.audioPlayer) {
    return;
  } else {
    [self.audioPlayer pause];
  }
}

RCT_EXPORT_METHOD(resume)
{
  if (!self.audioPlayer) {
    return;
  } else {
    [self.audioPlayer resume];
  }
}

RCT_EXPORT_METHOD(stop)
{
  if (!self.audioPlayer) {
    return;
  } else {
    [self.audioPlayer stop];
  }
  self.mediaUrl = @"";
}

RCT_EXPORT_METHOD(seek:(double)position)
{
  if (!self.audioPlayer) {
    return;
  } else {
    [self.audioPlayer seekToTime:position];
  }
}

RCT_EXPORT_METHOD(getStatus:(RCTResponseSenderBlock) callback)
{
  if (!self.audioPlayer) {
    callback(@[[NSNull null], @{@"status": @"ERROR", @"uri": self.mediaUrl}]);
  } else if ([self.audioPlayer state] == STKAudioPlayerStatePlaying) {
    callback(@[[NSNull null], @{@"status": @"PLAYING", @"uri": self.mediaUrl}]);
  } else if ([self.audioPlayer state] == STKAudioPlayerStateBuffering) {
    callback(@[[NSNull null], @{@"status": @"BUFFERING", @"uri": self.mediaUrl}]);
  } else {
    callback(@[[NSNull null], @{@"status": @"STOPPED", @"uri": self.mediaUrl}]);
  }
}

RCT_EXPORT_METHOD(getSeekStatus:(RCTResponseSenderBlock) callback)
{
  if (!self.audioPlayer) {
    callback(@[[NSNull null], @{@"duration": @0, @"position": @0}]);
  } else if ([self.audioPlayer state] == STKAudioPlayerStatePlaying) {
    if (self.audioPlayer.duration != 0) {
      callback(@[[NSNull null], @{@"duration": [NSNumber numberWithDouble:self.audioPlayer.duration], @"position": [NSNumber numberWithDouble:self.audioPlayer.progress]}]);
    } else {
      callback(@[[NSNull null], @{@"duration": @0, @"position": @0}]);
    }
  } else if ([self.audioPlayer state] == STKAudioPlayerStateBuffering) {
    callback(@[[NSNull null], @{@"duration": @0, @"position": @0}]);
  } else {
    callback(@[[NSNull null], @{@"duration": @0, @"position": @0}]);
  }
}

RCT_EXPORT_METHOD(setPlayingInfo:(NSString *)title album:(NSString *)album artist:(NSString *)artist)
{
  MPMediaItemArtwork *artwork = [[MPMediaItemArtwork alloc]initWithImage:[UIImage imageNamed:@"AboutLogo"]];
  NSDictionary *nowPlayingInfo = [NSDictionary dictionaryWithObjectsAndKeys:title, MPMediaItemPropertyAlbumTitle, album, MPMediaItemPropertyAlbumArtist, artist, MPMediaItemPropertyTitle, artwork, MPMediaItemPropertyArtwork, @"Podcast", MPMediaItemPropertyGenre, @(MPMediaTypePodcast), MPMediaItemPropertyMediaType, nil];
  [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo = nowPlayingInfo;
}


#pragma mark - StreamingKit Audio Player


- (void)audioPlayer:(STKAudioPlayer *)player didStartPlayingQueueItemId:(NSObject *)queueItemId
{
  NSLog(@"AudioPlayer is playing");
}

- (void)audioPlayer:(STKAudioPlayer *)player didFinishPlayingQueueItemId:(NSObject *)queueItemId withReason:(STKAudioPlayerStopReason)stopReason andProgress:(double)progress andDuration:(double)duration
{
  NSLog(@"AudioPlayer has stopped");
}

- (void)audioPlayer:(STKAudioPlayer *)player didFinishBufferingSourceWithQueueItemId:(NSObject *)queueItemId
{
  NSLog(@"AudioPlayer finished buffering");
}

- (void)audioPlayer:(STKAudioPlayer *)player unexpectedError:(STKAudioPlayerErrorCode)errorCode {
  NSLog(@"AudioPlayer unexpected Error with code %d", errorCode);
}

- (void)audioPlayer:(STKAudioPlayer *)player stateChanged:(STKAudioPlayerState)state previousState:(STKAudioPlayerState)previousState
{
  NSLog(@"AudioPlayer state has changed");
  switch (state) {
    case STKAudioPlayerStatePlaying:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"PLAYING", @"uri": self.mediaUrl}];
      break;

    case STKAudioPlayerStatePaused:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"PAUSED", @"uri": self.mediaUrl}];
      break;

    case STKAudioPlayerStateStopped:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"STOPPED", @"uri": self.mediaUrl}];
      break;

    case STKAudioPlayerStateBuffering:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"BUFFERING", @"uri": self.mediaUrl}];
      break;

    case STKAudioPlayerStateError:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"ERROR", @"uri": self.mediaUrl}];
      break;

    default:
      break;
  }
}


#pragma mark - Audio Session


- (void)setSharedAudioSessionCategory
{
  NSError *categoryError = nil;

  // Create shared session and set audio session category allowing background playback
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:&categoryError];

  if (categoryError) {
    NSLog(@"Error setting category! %@", [categoryError description]);
  }
}

- (void)registerAudioInterruptionNotifications
{
  // Register for audio interrupt notifications
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onAudioInterruption:)
                                               name:AVAudioSessionInterruptionNotification
                                             object:nil];
  // Register for route change notifications
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onRouteChangeInterruption:)
                                               name:AVAudioSessionRouteChangeNotification
                                             object:nil];
}

- (void)unregisterAudioInterruptionNotifications
{
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:AVAudioSessionRouteChangeNotification
                                                object:nil];
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:AVAudioSessionInterruptionNotification
                                                object:nil];
}

- (void)onAudioInterruption:(NSNotification *)notification
{
  // Get the user info dictionary
  NSDictionary *interruptionDict = notification.userInfo;

  // Get the AVAudioSessionInterruptionTypeKey enum from the dictionary
  NSInteger interuptionType = [[interruptionDict valueForKey:AVAudioSessionInterruptionTypeKey] integerValue];

  // Decide what to do based on interruption type
  switch (interuptionType)
  {
    case AVAudioSessionInterruptionTypeBegan:
      NSLog(@"Audio Session Interruption case started.");
      [self.audioPlayer pause];
      break;

    case AVAudioSessionInterruptionTypeEnded:
      NSLog(@"Audio Session Interruption case ended.");
      self.isPlayingWithOthers = [[AVAudioSession sharedInstance] isOtherAudioPlaying];
      (self.isPlayingWithOthers) ? [self.audioPlayer stop] : [self.audioPlayer resume];
      break;

    default:
      NSLog(@"Audio Session Interruption Notification case default.");
      break;
  }
}

- (void)onRouteChangeInterruption:(NSNotification *)notification
{

  NSDictionary *interruptionDict = notification.userInfo;
  NSInteger routeChangeReason = [[interruptionDict valueForKey:AVAudioSessionRouteChangeReasonKey] integerValue];

  switch (routeChangeReason)
  {
    case AVAudioSessionRouteChangeReasonUnknown:
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonUnknown");
      break;

    case AVAudioSessionRouteChangeReasonNewDeviceAvailable:
      // A user action (such as plugging in a headset) has made a preferred audio route available.
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonNewDeviceAvailable");
      break;

    case AVAudioSessionRouteChangeReasonOldDeviceUnavailable:
      // The previous audio output path is no longer available.
      [self.audioPlayer stop];
      break;

    case AVAudioSessionRouteChangeReasonCategoryChange:
      // The category of the session object changed. Also used when the session is first activated.
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonCategoryChange"); //AVAudioSessionRouteChangeReasonCategoryChange
      break;

    case AVAudioSessionRouteChangeReasonOverride:
      // The output route was overridden by the app.
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonOverride");
      break;

    case AVAudioSessionRouteChangeReasonWakeFromSleep:
      // The route changed when the device woke up from sleep.
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonWakeFromSleep");
      break;

    case AVAudioSessionRouteChangeReasonNoSuitableRouteForCategory:
      // The route changed because no suitable route is now available for the specified category.
      NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonNoSuitableRouteForCategory");
      break;
  }
}

#pragma mark - Remote Control Events

- (void)registerRemoteControlEvents
{
  MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
  [commandCenter.playCommand addTarget:self action:@selector(didReceivePlayCommand:)];
  [commandCenter.pauseCommand addTarget:self action:@selector(didReceivePauseCommand:)];
  [commandCenter.stopCommand addTarget:self action:@selector(didReceiveStopCommand:)];
  commandCenter.nextTrackCommand.enabled = NO;
  commandCenter.previousTrackCommand.enabled = NO;
  
  MPSkipIntervalCommand *skipBackwardIntervalCommand = [commandCenter skipBackwardCommand];
  skipBackwardIntervalCommand.preferredIntervals = @[@(30)];
  [skipBackwardIntervalCommand setEnabled:YES];
  [skipBackwardIntervalCommand addTarget:self action:@selector(didReceiveSkipBackwardEvent:)];
  
  MPSkipIntervalCommand *skipForwardIntervalCommand = [commandCenter skipForwardCommand];
  skipForwardIntervalCommand.preferredIntervals = @[@(30)];
  [skipForwardIntervalCommand setEnabled:YES];
  [skipForwardIntervalCommand addTarget:self action:@selector(didReceiveSkipForwardEvent:)];
}

- (void)didReceivePlayCommand:(MPRemoteCommand *)event
{
  [self resume];
}

- (void)didReceivePauseCommand:(MPRemoteCommand *)event
{
  [self pause];
}

- (void)didReceiveStopCommand:(MPRemoteCommand *)event
{
  [self stop];
}

- (void)didReceiveSkipBackwardEvent:(MPSkipIntervalCommandEvent *)event
{
  double nextSeek = self.audioPlayer.progress - event.interval;
  if (nextSeek < 0) {
    nextSeek = 0;
  }
  [self seek:nextSeek];
}

- (void)didReceiveSkipForwardEvent:(MPSkipIntervalCommandEvent *)event
{
  double nextSeek = self.audioPlayer.progress + event.interval;
  if (nextSeek > self.audioPlayer.duration) {
    nextSeek = self.audioPlayer.duration - 1;
  }
  [self seek:nextSeek];
}

- (void)unregisterRemoteControlEvents
{
  MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
  [commandCenter.playCommand removeTarget:self];
  [commandCenter.pauseCommand removeTarget:self];
  
  MPSkipIntervalCommand *skipBackwardIntervalCommand = [commandCenter skipBackwardCommand];
  [skipBackwardIntervalCommand removeTarget:self];
  MPSkipIntervalCommand *skipForwardIntervalCommand = [commandCenter skipForwardCommand];
  [skipForwardIntervalCommand removeTarget:self];
}

@end
