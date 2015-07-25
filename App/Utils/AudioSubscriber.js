/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  DeviceEventEmitter
} = React;
var AudioPlayer = require('../Lib/AudioPlayer');

class AudioSubscriber {
  constructor(stateFunc){
    this.initSubscribers(stateFunc);
  }

  initSubscribers(stateFunc) {
    this.audioSubscription = DeviceEventEmitter.addListener('AudioBridgeEvent', stateFunc);
    AudioPlayer.getStatus((error, status) => {
      error ? console.log('AudioSubscriber AudioBridgeEvent', error) : stateFunc(status)
    });
  }

  remove(){
    this.audioSubscription.remove();
  }
}


module.exports = AudioSubscriber;
