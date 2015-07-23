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
  constructor(callbackFunc){
    this.initSubscriber(callbackFunc);
  }

  initSubscriber(callbackFunc) {
    this.audioSubscription = DeviceEventEmitter.addListener('AudioBridgeEvent', callbackFunc);
    AudioPlayer.getStatus((error, status) => {
      error ? console.log('AudioSubscriber error', error) : callbackFunc(status)
    });
  }

  remove(){
    this.audioSubscription.remove();
  }
}


module.exports = AudioSubscriber;
