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
var AudioPlayer = require('./AudioPlayer');

class ViewSubscriber {

  initViewport(handler: Fulction) {
    this.viewportSubscription = DeviceEventEmitter.addListener('dimensionsDidChange', handler);
    ViewportManager.getCurrentDimensions(handler);
  }

  initAudio(handler: Fulction) {
    this.audioSubscription = DeviceEventEmitter.addListener('AudioBridgeEvent', handler);
    AudioPlayer.getStatus((error, status) => {
      error ? console.log('AudioSubscriber AudioBridgeEvent', error) : handler(status)
    });
  }

  remove(){
    if (typeof this.viewportSubscription !== 'undefined' && this.viewportSubscription !== null) {
      this.viewportSubscription.remove();
    }
    if (typeof this.audioSubscription !== 'undefined' && this.audioSubscription !== null) {
      this.audioSubscription.remove();
    }
  }

  static getDimensions(handler: Function) {
    ViewportManager.getCurrentDimensions(handler);
  }

}

module.exports = ViewSubscriber;
