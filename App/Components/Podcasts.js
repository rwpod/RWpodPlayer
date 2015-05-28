"use strict";

var React = require("react-native");
var {
  ActivityIndicatorIOS,
  ListView,
  TouchableHighlight,
  Text,
  View,
  StyleSheet
} = React;
var PodcastCell = require("./PodcastCell");
var Api = require("../Utils/Api");



class Podcasts extends React.Component {
  constructor(props) {
    super(props);
    /* binds */
    this.selectPodcast = this.selectPodcast.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this.loadPodcasts = this.loadPodcasts.bind(this);
    this.handlePodcastsResponse = this.handlePodcastsResponse.bind(this);
    this.handlePodcastsError = this.handlePodcastsError.bind(this);
    /* set state */
    this.state = {
      loading: false,
      dataNotLoaded: false,
      podcasts: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 })
    }
  }

  componentDidMount () {
    /* get podcasts */
    this.loadPodcasts();
  }

  loadPodcasts () {
    this.setState({
      loading: false,
      dataNotLoaded: false
    });
    // load data
    Api.getPodcasts()
      .then((res) => this.handlePodcastsResponse(res))
      .catch((err) => this.handlePodcastsError(err));
  }

  handlePodcastsError (err) {
    this.setState({
      loading: false,
      dataNotLoaded: true
    });
  }

  handlePodcastsResponse (res) {
    this.setState({
      loading: false,
      dataNotLoaded: false,
      podcasts: this._getDataSource(res)
    });
  }

  selectPodcast (podcast) {
    console.log("Podcast", podcast);
  }

  render () {
    return (
      <View style={styles.mainContainer}>
        {this._renderLoader()}
        {this._renderLoadButtons()}
        {this._renderPodcastsList()}
      </View>
    );
  }

  _renderPodcastsList() {
    if (!this.state.dataNotLoaded && !this.state.loading) {
      return (
        <ListView
          ref="listview"
          renderSeparator={this._renderSeparator}
          dataSource={this.state.podcasts}
          renderRow={this._renderRow}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="onDrag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false}
        />
      )
    }
  }

  _getDataSource (podcasts) {
    return this.state.podcasts.cloneWithRows(podcasts);
  }

  _renderRow (podcast, sectionID, rowID, highlightRowFunc) {
    return (
      <PodcastCell
        onSelect={() => this.selectPodcast(podcast)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        podcast={podcast}
      />
    );
  }

  _renderSeparator (sectionID, rowID, adjacentRowHighlighted) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={"SEP_" + sectionID + "_" + rowID}  style={style} />
    );
  }

  _renderLoadButtons() {
    if (this.state.dataNotLoaded) {
      return (
        <TouchableHighlight
          style={styles.retryButton}
          onPress={this.loadPodcasts}
          underlayColor="white">
          <Text style={styles.retryButtonText}> Load podcasts </Text>
        </TouchableHighlight>
      );
    }
  }

  _renderLoader() {
    if (this.state.loading) {
      return (
        <ActivityIndicatorIOS
          animating={this.state.loading}
          style={styles.loader}
          size="large"
        />
      );
    }
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
  loader: {
    alignItems: "center",
    justifyContent: "center",
    height: 80
  },
  retryButton: {
    height: 45,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "stretch",
    justifyContent: "center"
  },
  retryButtonText: {
    fontSize: 18,
    color: "#111",
    alignSelf: "center"
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4
  },
  rowSeparatorHide: {
    opacity: 0.0
  }
});


module.exports = Podcasts;
