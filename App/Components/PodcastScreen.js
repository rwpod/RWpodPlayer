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

class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor (props) {
    super(props);
    /* binds */
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this._improveHTML = this._improveHTML.bind(this);
  }

  _improveHTML() {
    return this.props.podcast.description.replace(/<a\s+/g, "<a target=\"_blank\" ");
  }

  onNavigationStateChange(navState) {
    console.log("onNavigationStateChange", navState);
  }

  render () {
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
            onNavigationStateChange={this.onNavigationStateChange}
            shouldInjectAJAXHandler={false}
            startInLoadingState={false}
          />
        </View>
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
