"use strict";

var React = require("react-native");
var {
  Text,
  View,
  StyleSheet
} = React;
var Api = require("../Utils/Api");

var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 30,
    marginTop: 65,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#48BBEC"
  }
});

class Podcasts extends React.Component {
  constructor(props) {
    super(props);
    /* binds */
    this.loadPodcasts = this.loadPodcasts.bind(this);
    this.handlePodcastsResponse = this.handlePodcastsResponse.bind(this);
    this.handlePodcastsError = this.handlePodcastsError.bind(this);
    /* get podcasts */
    this.loadPodcasts();
  }

  loadPodcasts () {
    Api.getPodcasts()
      .then((res) => this.handlePodcastsResponse(res))
      .catch((err) => this.handlePodcastsError(err));
  }

  handlePodcastsError (err) {
    console.log("Error", err);
  }

  handlePodcastsResponse (res) {
    console.log("Result", res);
  }

  render () {
    return (
      <View style={styles.mainContainer}>
        <Text>Testing the Router !!!</Text>
      </View>
    );
  }
}

module.exports = Podcasts;
