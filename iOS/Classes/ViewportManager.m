//
//  ViewportManager.m
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 8/9/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "ViewportManager.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"

static NSDictionary *RCTCurrentDimensions(orientation) {
  CGRect bounds = [UIScreen mainScreen].bounds;
  float width = bounds.size.width;
  float height = bounds.size.height;
  float tempWidth = width;
  
  if (UIDeviceOrientationIsLandscape(orientation)) {
    width = MAX(width, height);
  } else {
    width = MIN(width, height);
  }
  
  height = tempWidth != width ? tempWidth : height;
  
  return @{
           @"width": @(width),
           @"height": @(height)
           };
}


@implementation ViewportManager {
  NSDictionary *_lastKnownDimensions;
  NSArray *_supportedOrientations;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

#pragma mark - Lifecycle

- (instancetype)init {
  if ((self = [super init])) {
    _supportedOrientations = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UISupportedInterfaceOrientations"];
    
    // only use the status bar orientation initially, as it won't update later on
    _lastKnownDimensions = RCTCurrentDimensions([UIApplication sharedApplication].statusBarOrientation);
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(deviceOrientationDidChangeNotification:)
                                                 name:UIDeviceOrientationDidChangeNotification
                                               object:nil];
  }
  
  return self;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Conversion methods

- (NSString*)interfaceOrientationFromDeviceOrientation:(UIDeviceOrientation)orientation {
  NSString *str;
  UIInterfaceOrientation interfaceOrientation = (UIInterfaceOrientation)orientation;
  
  switch (interfaceOrientation) {
    case UIInterfaceOrientationUnknown:
      str = @"UIInterfaceOrientationUnknown";
      break;
    case UIInterfaceOrientationPortraitUpsideDown:
      str = @"UIInterfaceOrientationPortraitUpsideDown";
      break;
    case UIInterfaceOrientationPortrait:
      str = @"UIInterfaceOrientationPortrait";
      break;
    case UIInterfaceOrientationLandscapeRight:
      str = @"UIInterfaceOrientationLandscapeRight";
      break;
    case UIInterfaceOrientationLandscapeLeft:
      str = @"UIInterfaceOrientationLandscapeLeft";
      break;
  }
  
  return str;
}

- (BOOL)deviceOrientationIsSupportedByInterface:(UIDeviceOrientation)orientation {
  NSString *interfaceOrientation = [self interfaceOrientationFromDeviceOrientation:orientation];
  return [_supportedOrientations containsObject:interfaceOrientation];
}

#pragma mark - Notification methods

- (void)deviceOrientationDidChangeNotification:(NSNotification*)notification {
  UIDeviceOrientation orientation = [notification.object orientation];
  if ([self deviceOrientationIsSupportedByInterface:orientation]) {
    _lastKnownDimensions = RCTCurrentDimensions(orientation);
    [_bridge.eventDispatcher sendDeviceEventWithName:@"dimensionsDidChange" body:_lastKnownDimensions];
  }
}

#pragma mark - Public API
/**
 * Get the current dimensions of the viewport
 */
RCT_EXPORT_METHOD(getCurrentDimensions:(RCTResponseSenderBlock)callback) {
  _lastKnownDimensions = RCTCurrentDimensions([UIApplication sharedApplication].statusBarOrientation);
  callback(@[_lastKnownDimensions]);
}

@end
