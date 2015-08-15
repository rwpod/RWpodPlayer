/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  AppRegistry,
  NavigatorIOS,
  TabBarIOS,
  StyleSheet
} = React;
var EventEmitter = require("EventEmitter");
var Podcasts = require("./App/Components/Podcasts");
var AboutScreen = require("./App/Components/AboutScreen");
var ViewSubscriber = require("./App/Lib/ViewSubscriber");


class RWpodPlayer extends React.Component {
  static title: "<TabBarIOS>";
  static description: "Tab-based navigation";

  constructor (props) {
    super(props);
    /* binds*/
    this._isSelectedTab = this._isSelectedTab.bind(this);
    this._selectTab = this._selectTab.bind(this);
    this._refreshPodcasts = this._refreshPodcasts.bind(this);
    /* views */
    this._renderPodcasts = this._renderPodcasts.bind(this);
    this._renderAbout = this._renderAbout.bind(this);
    /* event emitter */
    this.emitter = new EventEmitter();
    /* state */
    this.state = {
      selectedTab: 'podcasts'
    };
  }

  render () {
    return (
      <TabBarIOS
        tintColor={'#087C78'}
        barTintColor={'#E2DBCB'}
        style={styles.tabBar}>
        <TabBarIOS.Item
          title={'Podcasts'}
          systemIcon='featured'
          style={styles.tabBarItem}
          selected={this._isSelectedTab('podcasts')}
          onPress={() => this._selectTab('podcasts')}>
          {this._renderPodcasts()}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title={'About'}
          systemIcon='more'
          style={styles.tabBarItem}
          selected={this._isSelectedTab('about')}
          onPress={() => this._selectTab('about')}>
          {this._renderAbout()}
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }

  _renderPodcasts() {
    return (
      <NavigatorIOS
        tintColor={'#087C78'}
        barTintColor={'#E2DBCB'}
        style={styles.navigatorContainer}
        initialRoute={{
          component: Podcasts,
          title: "Podcasts",
          rightButtonTitle: "Refresh",
          passProps: { emitter: this.emitter },
          onRightButtonPress: this._refreshPodcasts
        }}
      />
    )
  }

  _renderAbout() {
    return (
      <AboutScreen />
    )
  }

  _refreshPodcasts () {
    this.emitter.emit("refreshPodcasts");
  }

  _isSelectedTab (tabName): boolean {
    return tabName === this.state.selectedTab;
  }

  _selectTab (tabName) {
    this.setState({
      selectedTab: tabName
    });
  }

}


var styles = StyleSheet.create({
  tabBar: {
    flex: 1
  },
  tabBarItem: {
    flex: 1,
    backgroundColor: "#E2DBCB",
  },
  navigatorContainer: {
    flex: 1,
    backgroundColor: "#111111",
    marginBottom: 50
  }
});


AppRegistry.registerComponent("RWpodPlayer", () => RWpodPlayer);
