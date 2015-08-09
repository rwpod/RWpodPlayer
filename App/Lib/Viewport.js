/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  DeviceEventEmitter,
  NativeModules
} = React;
var {
  ViewportManager
} = NativeModules;

class Viewport {

  constructor(handler: Fulction){
    this.initSubscriber(handler);
  }

  initSubscriber(handler: Fulction) {
    this.viewportSubscription = DeviceEventEmitter.addListener('dimensionsDidChange', handler);
    ViewportManager.getCurrentDimensions(handler);
  }

  remove(){
    this.viewportSubscription.remove();
  }

  static getDimensions(handler: Function) {
    ViewportManager.getCurrentDimensions(handler);
  }

}

module.exports = Viewport;
