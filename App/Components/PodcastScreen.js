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
  StyleSheet,
  LinkingIOS
} = React;
var Slider = require('react-native-slider');
var { Icon } = require('react-native-icons');
var AudioPlayer = require('../Lib/AudioPlayer');
var AudioSubscriber = require('../Lib/AudioSubscriber');
var Viewport = require('../Lib/Viewport');


class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor(props) {
    super(props);
    /* binds */
    this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
    this.preventChangeHTML = this.preventChangeHTML.bind(this);
    this._changedOrientation = this._changedOrientation.bind(this);
    this._isDeviseInPortrait = this._isDeviseInPortrait.bind(this);
    this._renderPortrait = this._renderPortrait.bind(this);
    this._renderLandscape = this._renderLandscape.bind(this);
    /* slider */
    this._sliderOnSlidingStart = this._sliderOnSlidingStart.bind(this);
    this._sliderOnValueChange = this._sliderOnValueChange.bind(this);
    this._sliderOnSlidingComplete = this._sliderOnSlidingComplete.bind(this);
    /* audio binds */
    this._audioChangeState = this._audioChangeState.bind(this);
    this._onTogglePlay = this._onTogglePlay.bind(this);
    this._seekTimerCallback = this._seekTimerCallback.bind(this);
    /* state */
    this.state = {
      deviseOrientation: "portrait",
      podcastHTML: props.podcast.description,
      isAudioSeeking: false,
      audioData: {
        status: "STOPPED"
      },
      audioSeek: {
        duration: 0,
        position: 0
      }
    }
  }

  componentDidMount() {
    this.viewportSubscriber = new Viewport(this._changedOrientation);
    this.audioSubscriber = new AudioSubscriber(this._audioChangeState);
    /* seek timer */
    this.seekTimer = setInterval(this._seekTimerCallback, 500);
    this._seekTimerCallback();
  }

  componentWillUnmount() {
    this.viewportSubscriber.remove();
    this.audioSubscriber.remove();
    /* seek timer */
    clearInterval(this.seekTimer);
  }

  _audioChangeState(status) {
    this.setState({
      audioData: status
    });
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
    if ('about:blank' !== navState.url) {
      var url = navState.url;
      LinkingIOS.canOpenURL(url, (supported) => {
        if (!supported) {
          AlertIOS.alert('Can\'t handle url: ' + url);
        } else {
          LinkingIOS.openURL(url);
          this.preventChangeHTML();
        }
      });
    }
  }

  preventChangeHTML() {
    this.setState((prevState) => {
      var html = prevState.podcastHTML;
      if (html === this.props.podcast.description){
        html += "&nbsp;";
      } else {
        html = this.props.podcast.description;
      }
      prevState.podcastHTML = html;
      return prevState;
    });
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
        <Slider style={styles.portraitSeekSlider}
                 trackStyle={styles.sliderTrack}
                 thumbStyle={styles.sliderThumb}
                 value={this.state.audioSeek.position}
                 minimumValue={0}
                 maximumValue={this.state.audioSeek.duration}
                 onSlidingStart={this._sliderOnSlidingStart}
                 onValueChange={this._sliderOnValueChange}
                 onSlidingComplete={this._sliderOnSlidingComplete} />
        <View style={styles.portraitImageContainer}>
          <TouchableHighlight onPress={this._onTogglePlay} underlayColor='#FFFFFF'>
            <Icon
              name='ion|ios-play'
              size={90}
              color='#000000'
              style={audioControlStyles.playButtonIcon}
            />
          </TouchableHighlight>
          <Image
            source={{uri}}
            style={styles.portraitPodcastImage} />
        </View>
        <View style={styles.portraitInfoContainer}>
          <Text style={styles.portraitPodcastDate} numberOfLines={1}>
            {podcast.human_date}
            {' '}&bull;{' '}
            <Text style={styles.portraitPodcastDuration}>
              Duration {podcast.audio_duration}/{this.state.audioData.status}/{this.state.audioSeek.position}
            </Text>
          </Text>
        </View>
        <View style={styles.portraitWebContainer}>
          <WebView
            ref="webview"
            automaticallyAdjustContentInsets={false}
            bounces={true}
            style={styles.portraitWebView}
            html={this.state.podcastHTML}
            javaScriptEnabledAndroid={true}
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
            html={this.state.podcastHTML}
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

  _seekTimerCallback() {
    if ("PLAYING" === this.state.audioData.status && !this.state.isAudioSeeking) {
      AudioPlayer.getSeekStatus((error, seekData) => {
        if (error) {
          console.log('PodcastScreen seekTimerCallback', error)
        } else if (!this.state.isAudioSeeking) {
          this.setState({
            audioSeek: seekData
          });
        }
      });
    }
  }

  _sliderOnSlidingStart(value) {
    this.setState((prevState) => {
      prevState.isAudioSeeking = true;
      prevState.audioSeek.position = value;
      return prevState;
    });
    return value;
  }

  _sliderOnValueChange(value) {
    this.setState((prevState) => {
      prevState.audioSeek.position = value;
      return prevState;
    });
    return value;
  }

  _sliderOnSlidingComplete(value) {
    AudioPlayer.seek(value);
    this.setState((prevState) => {
      prevState.isAudioSeeking = false;
      prevState.audioSeek.position = value;
      return prevState;
    });
    return value;
  }
}


var audioControlStyles = StyleSheet.create({
  playButtonIcon: {
    width: 70,
    height: 90,
    margin: 10
  }
});


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
    height: 20,
    marginLeft: 30,
    marginRight: 30,
  },
  sliderTrack: {
    height: 10,
    borderRadius: 4,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 0.15,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#f8a1d6',
    borderColor: '#a4126e',
    borderWidth: 5,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 2,
    shadowOpacity: 0.35,
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
