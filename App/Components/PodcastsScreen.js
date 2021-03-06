/**
 * @flow
 */

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
var Subscribable = require("Subscribable");
var PodcastCell = require("./PodcastCell");
var PodcastScreen = require("./PodcastScreen");
var ViewSubscriber = require('../Lib/ViewSubscriber');
var Api = require("../Utils/Api");


class Podcasts extends React.Component {
  static propTypes: {
    emitter: React.PropTypes.object.idRequired
  };

  constructor(props, context) {
    super(props, context);
    /* binds */
    this.selectPodcast = this.selectPodcast.bind(this);
    this.loadPodcasts = this.loadPodcasts.bind(this);
    this.handlePodcastsResponse = this.handlePodcastsResponse.bind(this);
    this.handlePodcastsError = this.handlePodcastsError.bind(this);
    /* binds */
    this._renderRow = this._renderRow.bind(this);
    this._renderPodcastsList = this._renderPodcastsList.bind(this);
    this._renderSeparator = this._renderSeparator.bind(this);
    this._renderLoadButtons = this._renderLoadButtons.bind(this);
    this._renderLoader = this._renderLoader.bind(this);
    this._onEndReached = this._onEndReached.bind(this);
    this._mergeNewPodcasts = this._mergeNewPodcasts.bind(this);
    this._noMorePodcasts = this._noMorePodcasts.bind(this);
    this._handleRefreshPodcasts = this._handleRefreshPodcasts.bind(this);
    /* orientation */
    this._changedOrientation = this._changedOrientation.bind(this);
    this._isDeviseInPortrait = this._isDeviseInPortrait.bind(this);
    this._getMainStyles = this._getMainStyles.bind(this);
    /* set state */
    this.state = {
      deviseOrientation: "portrait",
      loading: false,
      dataNotLoaded: false,
      canLoadMore: true,
      currentPage: 1,
      podcasts: [],
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 })
    }
  }

  componentWillMount() {
    /* mixin */
    Subscribable.Mixin.componentWillMount();
  }

  componentDidMount() {
    /* get podcasts */
    if (0 === this.state.podcasts.length) {
      this.loadPodcasts();
    }
    Subscribable.Mixin.addListenerOn(this.props.emitter, 'refreshPodcasts', this._handleRefreshPodcasts);
    /* main */
    this.viewSubscriber = new ViewSubscriber();
    this.viewSubscriber.initViewport(this._changedOrientation);
  }

  componentWillUnmount() {
    /* mixin */
    Subscribable.Mixin.componentWillUnmount();
    /* cleanup */
    this.viewSubscriber.remove();
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

  _handleRefreshPodcasts() {
    this.loadPodcasts();
  }

  loadPodcasts() {
    this.setState({
      loading: true,
      dataNotLoaded: false,
      currentPage: 1,
      canLoadMore: true
    });
    // load data
    Api.getPodcasts()
      .then((res) => this.handlePodcastsResponse(res))
      .catch((err) => this.handlePodcastsError(err));
  }

  handlePodcastsError(err) {
    this.setState({
      loading: false,
      dataNotLoaded: true
    });
  }

  handlePodcastsResponse(res) {
    this.setState({
      loading: false,
      dataNotLoaded: false,
      currentPage: 1,
      canLoadMore: true,
      podcasts: res,
      dataSource: this._getDataSource(res)
    });
  }

  selectPodcast(podcast: Object) {
    this.props.navigator.push({
      title: podcast.title,
      component: PodcastScreen,
      passProps: {podcast},
    });
  }

  render() {
    return (
      <View style={this._getMainStyles()}>
        {this._renderLoader()}
        {this._renderLoadButtons()}
        {this._renderPodcastsList()}
      </View>
    );
  }

  _isDeviseInPortrait(): boolean {
    return "portrait" === this.state.deviseOrientation;
  }

  _getMainStyles() {
    if (this._isDeviseInPortrait()){
      return [styles.mainContainer, styles.portraitMainContainer];
    } else {
      return [styles.mainContainer, styles.landscapeMainContainer];
    }
  }

  _renderPodcastsList() {
    if (!this.state.dataNotLoaded && !this.state.loading) {
      return (
        <ListView
          ref="listview"
          renderSeparator={this._renderSeparator}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          onEndReached={this._onEndReached}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false}
        />
      )
    }
  }

  _getDataSource(podcasts: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(podcasts);
  }

  _renderRow(
    podcast: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PodcastCell
        onSelect={() => this.selectPodcast(podcast)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        podcast={podcast}
      />
    );
  }

  _renderSeparator(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={"SEP_" + sectionID + "_" + rowID}  style={style} />
    );
  }

  _onEndReached() {
    if (this.state.canLoadMore){
      /* set currentPage */
      var currentPage = this.state.currentPage + 1;
      this.setState({
        currentPage: currentPage
      });
      /* get api */
      Api.getPodcasts(currentPage)
        .then((res) => this._mergeNewPodcasts(res))
        .catch((err) => this._noMorePodcasts(err));
    }
  }

  _mergeNewPodcasts(res: Array<any>) {
    var podcasts = this.state.podcasts.concat(res);
    this.setState({
      podcasts: podcasts,
      dataSource: this._getDataSource(podcasts)
    });
  }

  _noMorePodcasts(err) {
    this.setState({
      canLoadMore: false
    });
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
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  portraitMainContainer: {
    marginTop: 65
  },
  landscapeMainContainer: {
    marginTop: 30
  },
  loader: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 200
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
