/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  Image,
  PixelRatio,
  Text,
  TouchableHighlight,
  View,
  WebView,
  ScrollView,
  StyleSheet
} = React;
var Viewport = require('react-native-viewport');

class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor (props) {
    super(props);
    /* binds */
    this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
    this._changedOrientation = this._changedOrientation.bind(this);
    this._isDeviseInPortrait = this._isDeviseInPortrait.bind(this);
    this._renderPortrait = this._renderPortrait.bind(this);
    this._renderLandscape = this._renderLandscape.bind(this);
    this._improveHTML = this._improveHTML.bind(this);
    /* state */
    this.state = {
      deviseOrientation: "portrait"
    }
  }

  componentWillMount () {
    Viewport.getDimensions(this._changedOrientation);
  }

  componentDidMount () {
    Viewport.addEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._changedOrientation);
  }

  componentWillUnmount () {
    Viewport.removeEventListener(Viewport.events.DEVICE_DIMENSIONS_EVENT, this._changedOrientation);
  }

  _improveHTML() {
    return this.props.podcast.description.replace(/<a\s+/g, "<a target=\"_blank\" ");
  }

  _changedOrientation (dimensions: Object) {
    var deviseOrientation = "portrait";
    if (dimensions.width > dimensions.height) {
      deviseOrientation = "landscape";
    }
    /* set state */
    this.setState({
      deviseOrientation: deviseOrientation
    });
  }


  _onNavigationStateChange (navState) {
    console.log("onNavigationStateChange", navState);
  }


  render () {
    if (this._isDeviseInPortrait()) {
      return this._renderPortrait();
    } else {
      return this._renderLandscape();
    }

  }


  _isDeviseInPortrait (): boolean {
    return "portrait" === this.state.deviseOrientation;
  }


  _renderPortrait() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;

    return (
      <View style={styles.mainContainer}>
        <Text style={styles.podcastTitle} numberOfLines={4}>
          {podcast.title}
        </Text>
        <View style={styles.controlContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{uri}}
              style={styles.podcastImage}
            />
          </View>
          <View style={styles.audioContainer}>
            <Text> Here will be audio controlls </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.podcastDate} numberOfLines={1}>
            {podcast.human_date}
            {' '}&bull;{' '}
            <Text style={styles.podcastDuration}>
              Duration {podcast.audio_duration}
            </Text>
          </Text>
        </View>
        <View style={styles.webContainer}>
          <WebView
            ref="webview"
            automaticallyAdjustContentInsets={false}
            bounces={true}
            style={styles.webView}
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

  _renderLandscape () {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;

    return (
      <View style={styles.mainContainer}>
        <Text style={styles.podcastTitle} numberOfLines={4}>
          {podcast.title}
        </Text>
      </View>
    );
  }

}



var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "column",
    backgroundColor: "#FFFFFF"
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  controlContainer: {
    flex: 1,
    flexDirection: "row",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 3,
  },
  podcastImage: {
    backgroundColor: "#dddddd",
    height: 200,
    width: 200,
  },
  audioContainer: {

  },
  infoContainer: {
    alignItems: "center",
  },
  podcastDate: {
    color: '#999999',
    fontSize: 16,
    padding: 5
  },
  podcastDuration: {
    color: '#999999',
    fontSize: 16,
  },
  webContainer: {
    flex: 1,
    alignItems: "stretch",
    borderColor: "#CCCCCC",
    borderWidth: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "#dddddd",
  }
});



module.exports = PodcastScreen;
