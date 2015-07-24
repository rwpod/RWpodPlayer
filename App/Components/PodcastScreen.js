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
  StyleSheet
} = React;
var Viewport = require('react-native-viewport');
var AudioPlayer = require('../Lib/AudioPlayer');
var RwpodSlider = require('../Lib/RwpodSlider');
var AudioSubscriber = require('../Utils/AudioSubscriber');


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
    this.audioSubscriber = new AudioSubscriber(this._audioChangeState);
  }

  componentWillUnmount() {
    Viewport.removeEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._firedChangedOrientation);
    this.audioSubscriber.remove();
  }

  _audioChangeState(status) {
    this.setState({
      audioData: status
    });
  }

  _improveHTML() {
    return this.props.podcast.description.replace(/<a\s+/g, "<a target=\"_blank\" ");
  }

  _firedChangedOrientation(dimensions: Object) {
    Viewport.getDimensions(this._changedOrientation); // args is invalid
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
        <RwpodSlider style={styles.portraitSeekSlider}
                     value={50}
                     minimumValue={0}
                     maximumValue={100}
                     onValueChange={(val) => console.log('RwpodSlider onValueChange', val) }
                     onSlidingComplete={(val) => console.log('RwpodSlider onSlidingComplete', val) } />
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
        AudioPlayer.setPlayingInfo(this.props.podcast.title, "", "RWpod");
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
  portraitSeekSlider: {
    height: 10,
    margin: 10,
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
