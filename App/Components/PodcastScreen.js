/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  Image,
  Text,
  TouchableHighlight,
  View,
  WebView,
  ScrollView,
  StyleSheet,
  DeviceEventEmitter
} = React;
var Viewport = require('react-native-viewport');
var AudioPlayer = require('../Lib/AudioPlayer');

class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor(props) {
    super(props);
    /* binds */
    this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
    this._changedOrientation = this._changedOrientation.bind(this);
    this._firedChangedOrientation = this._firedChangedOrientation.bind(this);
    this._isDeviseInPortrait = this._isDeviseInPortrait.bind(this);
    this._renderPortrait = this._renderPortrait.bind(this);
    this._renderLandscape = this._renderLandscape.bind(this);
    this._improveHTML = this._improveHTML.bind(this);
    /* audio binds */
    this._audioChangeState = this._audioChangeState.bind(this);
    this._onTogglePlay = this._onTogglePlay.bind(this);
    /* state */
    this.state = {
      deviseOrientation: "portrait",
      audioData: {
        status: "STOPPED"
      }
    }
  }

  componentWillMount() {
    Viewport.getDimensions(this._changedOrientation);
  }

  componentDidMount() {
    Viewport.addEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._firedChangedOrientation);
    /* audio */
    this.subscription = DeviceEventEmitter.addListener('AudioBridgeEvent', this._audioChangeState);
    AudioPlayer.getStatus((error, status) => {
      error ? console.log(error) : this._audioChangeState(status)
    });
  }

  componentWillUnmount() {
    Viewport.removeEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._firedChangedOrientation);
    this.subscription.remove();
  }

  _audioChangeState(status) {
    this.setState((prevState) => {
      prevState.audioData = status;
      return prevState;
    });
  }

  _improveHTML() {
    return this.props.podcast.description.replace(/<a\s+/g, "<a target=\"_blank\" ");
  }

  _firedChangedOrientation(dimensions: Object) {
    // dimensions is invalid, need get it fron callback
    Viewport.getDimensions(this._changedOrientation);
  }

  _changedOrientation(dimensions: Object) {
    var deviseOrientation = "portrait";
    if (dimensions.width > dimensions.height) {
      deviseOrientation = "landscape";
    }
    /* set state */
    this.setState({
      deviseOrientation: deviseOrientation
    });
  }


  _onNavigationStateChange(navState) {
    console.log("onNavigationStateChange", navState);
  }


  render() {
    if (this._isDeviseInPortrait()) {
      return this._renderPortrait();
    } else {
      return this._renderLandscape();
    }
  }


  _isDeviseInPortrait(): boolean {
    return "portrait" === this.state.deviseOrientation;
  }


  _renderPortrait() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;

    return (
      <View style={styles.portraitMainContainer}>
        <View style={styles.portraitImageContainer}>
          <TouchableHighlight onPress={this._onTogglePlay}>
            <Image
              source={{uri}}
              style={styles.portraitPodcastImage}
            />
          </TouchableHighlight>
        </View>
        <View style={styles.portraitInfoContainer}>
          <Text style={styles.portraitPodcastDate} numberOfLines={1}>
            {podcast.human_date}
            {' '}&bull;{' '}
            <Text style={styles.portraitPodcastDuration}>
              Duration {podcast.audio_duration}/{this.state.audioData.status}
            </Text>
          </Text>
        </View>
        <View style={styles.portraitWebContainer}>
          <WebView
            ref="webview"
            automaticallyAdjustContentInsets={false}
            bounces={true}
            style={styles.portraitWebView}
            html={this._improveHTML()}
            javaScriptEnabledAndroid={false}
            onNavigationStateChange={this._onNavigationStateChange}
            shouldInjectAJAXHandler={false}
            startInLoadingState={false}
          />
        </View>
      </View>
    );
  }

  _renderLandscape() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;

    return (
      <View style={styles.landscapeMainContainer}>
        <View style={styles.landscapeCompContainer}>
          <View style={styles.landscapeImageContainer}>
            <TouchableHighlight onPress={this._onTogglePlay}>
              <Image
                source={{uri}}
                style={styles.landscapePodcastImage}
              />
            </TouchableHighlight>
          </View>
          <View style={styles.landscapeInfoContainer}>
            <Text style={styles.landscapePodcastDate} numberOfLines={1}>
              {podcast.human_date}
              {' '}&bull;{' '}
              <Text style={styles.landscapePodcastDuration}>
                Duration {podcast.audio_duration}/{this.state.audioData.status}
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.landscapeWebContainer}>
          <WebView
            ref="webview"
            automaticallyAdjustContentInsets={false}
            bounces={true}
            style={styles.landscapeWebView}
            html={this._improveHTML()}
            javaScriptEnabledAndroid={false}
            onNavigationStateChange={this._onNavigationStateChange}
            shouldInjectAJAXHandler={false}
            startInLoadingState={false}
          />
        </View>
      </View>
    );
  }

  _onTogglePlay() {
    switch(this.state.audioData.status){
      case "STOPPED":
        AudioPlayer.play(this.props.podcast.audio_url);
        break;
      case "PLAYING":
        AudioPlayer.pause();
        break;
      case "PAUSED":
        AudioPlayer.resume();
        break;
      default:
        AudioPlayer.stop();
    }
  }

}



var styles = StyleSheet.create({
  portraitMainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "column",
    backgroundColor: "#FFFFFF"
  },
  portraitImageContainer: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 3,
  },
  portraitPodcastImage: {
    backgroundColor: "#dddddd",
    height: 200,
    width: 200,
  },
  portraitAudioContainer: {

  },
  portraitInfoContainer: {
    alignItems: "center",
  },
  portraitPodcastDate: {
    color: '#999999',
    fontSize: 16,
    padding: 5
  },
  portraitPodcastDuration: {
    color: '#999999',
    fontSize: 16,
  },
  portraitWebContainer: {
    flex: 1,
    alignItems: "stretch",
    borderColor: "#CCCCCC",
    borderWidth: 1,
  },
  portraitWebView: {
    flex: 1,
    backgroundColor: "#dddddd",
  },


  landscapeMainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "row",
    backgroundColor: "#FFFFFF"
  },
  landscapeCompContainer: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 3,
  },
  landscapeImageContainer: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 3,
  },
  landscapePodcastImage: {
    backgroundColor: "#dddddd",
    height: 200,
    width: 200,
  },
  landscapeInfoContainer: {
    alignItems: "center",
  },
  landscapePodcastDate: {
    color: '#999999',
    fontSize: 16,
    padding: 5
  },
  landscapePodcastDuration: {
    color: '#999999',
    fontSize: 16,
  },
  landscapeWebContainer: {
    flex: 1,
    alignItems: "stretch",
    borderColor: "#CCCCCC",
    borderWidth: 1,
  },
  landscapeWebView: {
    flex: 1,
    backgroundColor: "#dddddd",
  }
});



module.exports = PodcastScreen;
