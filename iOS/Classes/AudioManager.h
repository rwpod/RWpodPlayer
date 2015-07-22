//
//  AudioManager.h
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 7/22/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTBridgeModule.h"
#import "STKAudioPlayer.h"

@interface AudioManager : NSObject <RCTBridgeModule, STKAudioPlayerDelegate>

@property (nonatomic, strong) STKAudioPlayer *audioPlayer;
@property (nonatomic, readwrite) BOOL isPlayingWithOthers;

- (void)play:(NSString *) uri;
- (void)pause;

@end
