//
//  RwpodSliderManager.m
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 7/24/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RwpodSliderManager.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RwpodSlider.h"
#import "UIView+React.h"

@implementation RwpodSliderManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  RwpodSlider *slider = [[RwpodSlider alloc] init];
  [slider addTarget:self action:@selector(sliderValueChanged:) forControlEvents:UIControlEventValueChanged];
  [slider addTarget:self action:@selector(sliderTouchEnd:) forControlEvents:UIControlEventTouchUpInside];
  [slider addTarget:self action:@selector(sliderTouchEnd:) forControlEvents:UIControlEventTouchUpOutside];
  return slider;
}

static void RWSliderEvent(RwpodSliderManager *self, UISlider *sender, BOOL continuous)
{
  NSDictionary *event = @{
                          @"target": sender.reactTag,
                          @"value": @(sender.value),
                          @"continuous": @(continuous),
                          };
  
  [self.bridge.eventDispatcher sendInputEventWithName:@"topChange" body:event];
}

- (void)sliderValueChanged:(UISlider *)sender
{
  RWSliderEvent(self, sender, YES);
}

- (void)sliderTouchEnd:(UISlider *)sender
{
  RWSliderEvent(self, sender, NO);
}

RCT_EXPORT_VIEW_PROPERTY(value, float);
RCT_EXPORT_VIEW_PROPERTY(minimumValue, float);
RCT_EXPORT_VIEW_PROPERTY(maximumValue, float);
RCT_EXPORT_VIEW_PROPERTY(minimumTrackTintColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(maximumTrackTintColor, UIColor);

@end

