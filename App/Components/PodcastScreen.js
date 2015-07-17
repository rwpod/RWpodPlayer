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
var Video = require('react-native-video');

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
    this.renderAudioComponent = this.renderAudioComponent.bind(this);
    this.audioOnLoadStart = this.audioOnLoadStart.bind(this);
    this.audioOnLoad = this.audioOnLoad.bind(this);
    this.audioOnProgress = this.audioOnProgress.bind(this);
    this.audioOnEnd = this.audioOnEnd.bind(this);
    this.audioOnError = this.audioOnError.bind(this);
    this._onTogglePlay = this._onTogglePlay.bind(this);
    /* state */
    this.state = {
      deviseOrientation: "portrait",
      audioControls: {
        paused: true
      },
      audioData: {
        loading: false,
        haveError: false,
        duration: 0.0,
        currentTime: 0.0
      }
    }
  }

  componentWillMount() {
    Viewport.getDimensions(this._changedOrientation);
  }

  componentDidMount() {
    Viewport.addEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._firedChangedOrientation);
  }

  componentWillUnmount() {
    Viewport.removeEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._firedChangedOrientation);
  }

  _improveHTML() {
    return this.props.podcast.description.replace(/<a\s+/g, "<a target=\"_blank\" ");
  }

  _firedChangedOrientation(dimensions: Object) {
    // dimensions is invalid
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
        {this.renderAudioComponent(podcast)}
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
              Duration {this.state.audioData.currentTime}/{podcast.audio_duration}
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
        {this.renderAudioComponent(podcast)}
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
                Duration {this.state.audioData.currentTime}/{podcast.audio_duration}
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
    this.setState((prevState) => {
      prevState.audioControls.paused = !prevState.audioControls.paused;
      return prevState;
    });
  }

  renderAudioComponent(podcast: Object) {
    var pausedBool = this.state.audioControls.paused;
    var pausedInt = pausedBool ? 0 : 1;
    return (
      <Video source={{uri: podcast.audio_url}} // Can be a URL or a local file.
       rate={pausedInt}                   // 0 is paused, 1 is normal.
       volume={1}                 // 0 is muted, 1 is normal.
       muted={false}                // Mutes the audio entirely.
       paused={pausedBool}               // Pauses playback entirely.
       resizeMode="cover"           // Fill the whole screen at aspect ratio.
       repeat={false}                // Repeat forever.
       onLoadStart={this.audioOnLoadStart} // Callback when video starts to load
       onLoad={this.audioOnLoad}    // Callback when video loads
       onProgress={this.audioOnProgress}    // Callback every ~250ms with currentTime
       onEnd={this.audioOnEnd}           // Callback when playback finishes
       onError={this.audioOnError}    // Callback when video cannot be loaded
       style={styles.audioComponent} />
    )
  }

  audioOnLoadStart() {
    this.setState((prevState) => {
      prevState.audioData.loading = true;
      prevState.audioData.haveError = false;
      return prevState;
    });
  }

  audioOnLoad(data) {
    this.setState((prevState) => {
      prevState.audioData.loading = false;
      prevState.audioData.duration = data.duration;
      return prevState;
    });
  }

  audioOnProgress(data) {
    this.setState((prevState) => {
      prevState.audioData.currentTime = parseInt(data.currentTime, 10);
      return prevState;
    });
  }

  audioOnEnd() {
    console.log('Done');
  }

  audioOnError(e) {
    this.setState((prevState) => {
      prevState.audioData.loading = false;
      prevState.audioData.haveError = true;
      return prevState;
    });
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
  },
  audioComponent: {

  }
});



module.exports = PodcastScreen;
