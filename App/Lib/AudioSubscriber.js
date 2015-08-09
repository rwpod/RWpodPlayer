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

  constructor(handler: Fulction){
    this.initSubscriber(handler);
  }

  initSubscriber(handler: Fulction) {
    this.audioSubscription = DeviceEventEmitter.addListener('AudioBridgeEvent', handler);
    AudioPlayer.getStatus((error, status) => {
      error ? console.log('AudioSubscriber AudioBridgeEvent', error) : handler(status)
    });
  }

  remove(){
    this.audioSubscription.remove();
  }
  
}


module.exports = AudioSubscriber;
