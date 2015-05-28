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

  constructor (props) {
    super(props);
  }

  render () {
    var uri = this.props.podcast.main_img;
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
              <Text style={styles.podcastTitle} numberOfLines={2}>
                {this.props.podcast.title}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
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
  },
  cellBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    // Trick to get the thinest line the device can display
    height: 1 / PixelRatio.get(),
    marginLeft: 1
  }
});



module.exports = PodcastCell;
