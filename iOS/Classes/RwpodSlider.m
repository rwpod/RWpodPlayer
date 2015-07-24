//
//  RwpodSlider.m
//  RWpodPlayer
//
//  Created by Alexey Vasiliev on 7/24/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RwpodSlider.h"

@implementation RwpodSlider
{
  float _unclippedValue;
}

- (void)setValue:(float)value
{
  _unclippedValue = value;
  super.value = value;
}

- (void)setMinimumValue:(float)minimumValue
{
  super.minimumValue = minimumValue;
  super.value = _unclippedValue;
}

- (void)setMaximumValue:(float)maximumValue
{
  super.maximumValue = maximumValue;
  super.value = _unclippedValue;
}

@end
