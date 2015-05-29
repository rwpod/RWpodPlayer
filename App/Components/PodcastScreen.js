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

class PodcastScreen extends React.Component {

  static propTypes: {
    podcast: React.PropTypes.object.idRequired
  };

  constructor (props) {
    super(props);
  }

  render () {
    var podcast = this.props.podcast;
    return (
      <View style={styles.mainContainer}>
        <Text numberOfLines={2}>
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
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
});



module.exports = PodcastScreen;
