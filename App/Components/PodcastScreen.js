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
  LinkingIOS,
  AlertIOS,
  PixelRatio
} = React;
var Slider = require('react-native-slider');
var { Icon } = require('react-native-icons');
var AudioPlayer = require('../Lib/AudioPlayer');
var Device = require('../Lib/Device');
var ViewSubscriber = require('../Lib/ViewSubscriber');

class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor(props, context) {
    super(props, context);
    /* binds */
    this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
    this.preventChangeHTML = this.preventChangeHTML.bind(this);
    this._changedOrientation = this._changedOrientation.bind(this);
    this._isDeviseInPortrait = this._isDeviseInPortrait.bind(this);
    this._renderIphonePortrait = this._renderIphonePortrait.bind(this);
    this._renderIphoneLandscape = this._renderIphoneLandscape.bind(this);
    /* slider */
    this._sliderOnSlidingStart = this._sliderOnSlidingStart.bind(this);
    this._sliderOnValueChange = this._sliderOnValueChange.bind(this);
    this._sliderOnSlidingComplete = this._sliderOnSlidingComplete.bind(this);
    /* audio binds */
    this._audioChangeState = this._audioChangeState.bind(this);
    this._onTogglePlay = this._onTogglePlay.bind(this);
    this._onStopPlay = this._onStopPlay.bind(this);
    this._seekTimerCallback = this._seekTimerCallback.bind(this);
    this.showHumanAudioPosition = this.showHumanAudioPosition.bind(this);
    this.isCurrentAudio = this.isCurrentAudio.bind(this);
    this.initialState = this.initialState.bind(this);
    /* state */
    this.state = this.initialState(props);
  }

  initialState(props) {
    return {
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
    };
  }

  isCurrentAudio() {
    var uri = this.state.audioData.uri;
    return (uri && uri === this.props.podcast.audio_url);
  }

  componentDidMount() {
    this.viewSubscriber = new ViewSubscriber();
    this.viewSubscriber.initViewport(this._changedOrientation);
    this.viewSubscriber.initAudio(this._audioChangeState);
    /* seek timer */
    this.seekTimer = setInterval(this._seekTimerCallback, 500);
    this._seekTimerCallback();
  }

  componentWillUnmount() {
    this.viewSubscriber.remove();
    /* seek timer */
    clearInterval(this.seekTimer);
  }

  _audioChangeState(status) {
    if (status && status.uri && status.uri === this.props.podcast.audio_url){
      this.setState({
        audioData: status
      });
    }
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
    if (typeof navState.url !== 'undefined' && 'about:blank' !== navState.url) {
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
      var htmlOriginal = this.props.podcast.description;
      var html = prevState.podcastHTML;

      if (html === htmlOriginal) {
        html = htmlOriginal + "&nbsp;";
      } else {
        html = htmlOriginal;
      }
      prevState.podcastHTML = html;
      return prevState;
    });
  }

  _isDeviseInPortrait(): boolean {
    return "portrait" === this.state.deviseOrientation;
  }

  _onTogglePlay() {
    if (this.isCurrentAudio()) {
      var status = this.state.audioData.status;

      switch(status){
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
    } else {
      AudioPlayer.play(this.props.podcast.audio_url);
      AudioPlayer.setPlayingInfo(this.props.podcast.title, "", "RWpod");
    }
  }

  _onStopPlay() {
    if (this.isCurrentAudio()) {
      AudioPlayer.stop();
      this.setState({
        audioData: {
          status: "STOPPED"
        },
        audioSeek: {
          position: 0
        }
      });
    }
  }

  _seekTimerCallback() {
    if (this.isCurrentAudio() && "PLAYING" === this.state.audioData.status && !this.state.isAudioSeeking) {
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

  showHumanAudioPosition() {
    var totalSec = Math.round(this.state.audioSeek.position);
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = totalSec % 60;
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds)
  }






  render() {
    if (Device.isIpad()) {
      return (
        <View style={portraitStyles.mainContainer}>
          <Text>Comming soon for IPAD</Text>
        </View>
      )
    } else {
      if (this._isDeviseInPortrait()) {
        return this._renderIphonePortrait();
      } else {
        return this._renderIphoneLandscape();
      }
    }
  }


  _renderIphonePortrait() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;
    var styles = portraitStyles;

    return (
      <View style={styles.mainContainer}>

        <View style={styles.topContainer}>
          <Image
            source={{uri}}
            style={styles.podcastImage} />

            <View style={styles.infoCellsContainer}>
              <Text style={styles.podcastDate} numberOfLines={1}>
                Дата: {podcast.human_date}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableHighlight onPress={this._onTogglePlay} underlayColor='#FFFFFF'>
                  <Icon
                    name={["PLAYING", "BUFFERING"].indexOf(this.state.audioData.status) >= 0 ? 'ion|pause' : 'ion|play'}
                    size={90}
                    color='#000000'
                    style={audioControlStyles.buttonIcon}
                  />
                </TouchableHighlight>
                {this.state.audioData.status !== "STOPPED" && <TouchableHighlight onPress={this._onStopPlay} underlayColor='#FFFFFF'>
                  <Icon
                    name='ion|stop'
                    size={90}
                    color='#000000'
                    style={audioControlStyles.buttonIcon}
                  />
                </TouchableHighlight>}
              </View>
            </View>
        </View>

        <View style={styles.sliderContainer}>
            <Slider style={styles.seekSlider}
                     trackStyle={styles.sliderTrack}
                     thumbStyle={styles.sliderThumb}
                     minimumTrackTintColor='#31a4db'
                    thumbTouchSize={{width: 50, height: 40}}
                     value={this.state.audioSeek.position}
                     minimumValue={0}
                     maximumValue={this.state.audioSeek.duration}
                     onSlidingStart={this._sliderOnSlidingStart}
                     onValueChange={this._sliderOnValueChange}
                     onSlidingComplete={this._sliderOnSlidingComplete} />
          <View style={styles.sliderInfoContainer}>
            <Text style={styles.podcastPosition} numberOfLines={1}>
              {this.showHumanAudioPosition()}
            </Text>
            <Text style={styles.podcastAudioState} numberOfLines={1}>
              {this.state.audioData.status}
            </Text>
            <Text style={styles.podcastDuration} numberOfLines={1}>
              {podcast.audio_duration}
            </Text>
           </View>
        </View>

        <View style={styles.webContainer}>
          <WebView
            ref="webview"
            automaticallyAdjustContentInsets={false}
            bounces={true}
            style={styles.webView}
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

  _renderIphoneLandscape() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;
    var styles = landscapeStyles;
    return (
      <View style={styles.mainContainer}>
        <Text>Comming soon</Text>
      </View>
    )
    /*
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
    */
  }

}


var audioControlStyles = StyleSheet.create({
  buttonIcon: {
    width: 70,
    height: 90,
    margin: 10
  }
});

var portraitStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "column",
    backgroundColor: "#FFFFFF"
  },
  topContainer: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    height: 200,
  },
  podcastImage: {
    backgroundColor: "#DDDDDD",
    height: 150,
    width: 150,
    borderStyle: "solid",
    borderColor: "#CCCCCC",
    borderWidth: 1 / PixelRatio.get(),
  },
  infoCellsContainer: {
    flex: 1,
    flexDirection: "column",
  },
  podcastDate: {
    color: '#999999',
    fontSize: 16,
    padding: 5,
    textAlign: "center",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  sliderContainer: {
    flex: 1,
    flexDirection: "column",
  },
  seekSlider: {
    height: 20,
    marginLeft: 40,
    marginRight: 40,
  },
  sliderTrack: {
    height: 2,
    backgroundColor: '#303030',
  },
  sliderThumb: {
    width: 10,
    height: 10,
    backgroundColor: '#31a4db',
    borderRadius: 10 / 2,
    shadowColor: '#31a4db',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 2,
    shadowOpacity: 1,
  },
  sliderInfoContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sliderInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  podcastPosition: {
    flex: 2,
    color: '#999999',
    fontSize: 16,
    textAlign: "left",
    marginLeft: 40,
  },
  podcastAudioState: {
    flex: 3,
    color: '#999999',
    fontSize: 16,
    textAlign: "center",
  },
  podcastDuration: {
    flex: 2,
    color: '#999999',
    fontSize: 16,
    textAlign: "right",
    marginRight: 40,
  },
  webContainer: {
    flex: 9,
    alignItems: "stretch",
    borderColor: "#CCCCCC",
    borderWidth: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "#dddddd",
  },
});

var landscapeStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "column",
    backgroundColor: "#FFFFFF"
  },
});

/*
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
*/


module.exports = PodcastScreen;
