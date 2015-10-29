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
  StyleSheet
} = React;

class PodcastCell extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    var podcast = this.props.podcast;
    var uri = podcast.main_img;
    return (
      <View>
        <TouchableHighlight
          onPress={this.props.onSelect}
          onShowUnderlay={this.props.onHighlight}
          onHideUnderlay={this.props.onUnhighlight}>
          <View style={styles.row}>
            <Image
              source={{uri}}
              style={styles.cellImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.podcastTitle} numberOfLines={4}>
                {podcast.title}
              </Text>
              <Text style={styles.podcastDate} numberOfLines={1}>
                {podcast.human_date}
                {' '}&bull;{' '}
                <Text style={styles.podcastDuration}>
                  Длительность {podcast.audio_duration}
                </Text>
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.cellBorder}></View>
      </View>
    );
  }

}



var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  podcastTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  row: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 2,
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 100,
    marginRight: 5,
    width: 100,
    borderColor: "#CCCCCC",
    borderWidth: 1 / PixelRatio.get(),
  },
  cellBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    // Trick to get the thinest line the device can display
    height: 1 / PixelRatio.get(),
    marginLeft: 1
  },
  podcastDate: {
    color: '#999999',
    fontSize: 12,
  },
  podcastDuration: {
    color: '#999999'
  }
});



module.exports = PodcastCell;
