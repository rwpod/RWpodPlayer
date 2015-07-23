/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  NetInfo,
  AlertIOS,
  NativeModules
} = React;
var {
  AudioManager
} = NativeModules;

class AudioPlayer {

  static start() {
    NetInfo.reachabilityIOS.fetch().done((reach) => {
      if (reach !== 'wifi') {
        AlertIOS.alert(
          'Data Usage Rates Apply',
          'You are not connected to Wi-Fi. Would you like to use your wireless provider instead?',
          [
            {text: 'Okay', onPress: () => AudioPlayer.resume()},
            {text: 'Nope!', onPress: () => AudioPlayer.stop()}
          ]
        );
      } else {
        AudioPlayer.resume();
      }
    });
  }

  static play(uri: string) {
    AudioManager.play(uri);
  }
  static stop() {
    AudioManager.stop();
  }
  static pause() {
    AudioManager.pause();
  }
  static resume() {
    AudioManager.resume();
  }
  static getStatus(callback) {
    if (callback && 'function' === typeof callback) {
      return AudioManager.getStatus(callback);
    }
  }

}

module.exports = AudioPlayer;
