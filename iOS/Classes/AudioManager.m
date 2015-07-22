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
    self.audioPlayer = [[STKAudioPlayer alloc] initWithOptions:(STKAudioPlayerOptions){ .readBufferSize = 200 }];
    [self.audioPlayer setDelegate:self];
    [self setSharedAudioSessionCategory];
    [self registerAudioInterruptionNotifications];
    [self registerRemoteControlEvents];
    [self setNowPlayingInfo];
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

RCT_EXPORT_METHOD(play:(NSString *) uri)
{
  if (!self.audioPlayer) {
    return;
  }
  if (self.audioPlayer.state == STKAudioPlayerStatePaused) {
    [self.audioPlayer resume];
  } else {
    [self.audioPlayer play:uri];
  }
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
}

RCT_EXPORT_METHOD(getStatus: (RCTResponseSenderBlock) callback)
{
  if (!self.audioPlayer) {
    callback(@[[NSNull null], @{@"status": @"ERROR"}]);
  } else if ([self.audioPlayer state] == STKAudioPlayerStatePlaying) {
    callback(@[[NSNull null], @{@"status": @"PLAYING"}]);
  } else if ([self.audioPlayer state] == STKAudioPlayerStateBuffering) {
    callback(@[[NSNull null], @{@"status": @"BUFFERING"}]);
  } else {
    callback(@[[NSNull null], @{@"status": @"STOPPED"}]);
  }
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
                                                      body:@{@"status": @"PLAYING"}];
      break;

    case STKAudioPlayerStatePaused:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"PAUSED"}];
      break;

    case STKAudioPlayerStateStopped:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"STOPPED"}];
      break;

    case STKAudioPlayerStateBuffering:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"BUFFERING"}];
      break;

    case STKAudioPlayerStateError:
      [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent"
                                                      body:@{@"status": @"ERROR"}];
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
  commandCenter.stopCommand.enabled = NO;
  commandCenter.nextTrackCommand.enabled = NO;
  commandCenter.previousTrackCommand.enabled = NO;
}

- (void)didReceivePlayCommand:(MPRemoteCommand *)event
{
  [self resume];
}

- (void)didReceivePauseCommand:(MPRemoteCommand *)event
{
  [self pause];
}

- (void)unregisterRemoteControlEvents
{
  MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
  [commandCenter.playCommand removeTarget:self];
  [commandCenter.pauseCommand removeTarget:self];
}

- (void)setNowPlayingInfo
{
  MPMediaItemArtwork *artwork = [[MPMediaItemArtwork alloc]initWithImage:[UIImage imageNamed:@"RWpodLogo"]];
  NSDictionary *nowPlayingInfo = [NSDictionary dictionaryWithObjectsAndKeys:@"RWpod", MPMediaItemPropertyAlbumTitle, @"", MPMediaItemPropertyAlbumArtist, @"Podcast", MPMediaItemPropertyTitle, artwork, MPMediaItemPropertyArtwork, nil];
  [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo = nowPlayingInfo;
}

@end
