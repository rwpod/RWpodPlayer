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

  static subscribe(handler: Function) {
    return DeviceEventEmitter.addListener(
      'dimensionsDidChange',
      handler
    );
  }

  static unsubscribe(subscriber: object) {
    subscriber.remove();
  }

  static getDimensions(handler: Function) {
    ViewportManager.getCurrentDimensions(handler);
  }

}

module.exports = Viewport;
