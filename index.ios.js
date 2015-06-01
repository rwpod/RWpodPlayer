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
var AboutScreen = require("./App/Components/AboutScreen")


class RWpodPlayer extends React.Component {
  static title: "<TabBarIOS>";
  static description: "Tab-based navigation";

  constructor (props) {
    super(props);
    /* binds*/
    this._isSelectedTab = this._isSelectedTab.bind(this);
    this._selectTab = this._selectTab.bind(this);
    this._refreshPodcasts = this._refreshPodcasts.bind(this);
    /* event emitter */
    this.emitter = new EventEmitter();
    /* state */
    this.state = {
      selectedTab: 'podcasts'
    };
  }

  render () {
    return (
      <TabBarIOS>
        <TabBarIOS.Item
          systemIcon="featured"
          selected={this._isSelectedTab('podcasts')}
          onPress={() => this._selectTab('podcasts')}>
            <NavigatorIOS
              style={styles.container}
              initialRoute={{
                component: Podcasts,
                title: "Podcasts",
                rightButtonTitle: "Refresh",
                passProps: { emitter: this.emitter },
                onRightButtonPress: this._refreshPodcasts
              }}
            />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          systemIcon="contacts"
          selected={this._isSelectedTab('about')}
          onPress={() => this._selectTab('about')}>
            <AboutScreen />
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }

  _refreshPodcasts () {
    this.emitter.emit("refreshPodcasts", true);
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
  container: {
    flex: 1,
    backgroundColor: "#111111",
    marginBottom: 50
  },
  tabContent: {
    flex: 1,
    alignItems: "center"
  },
  tabText: {
    color: "white",
    margin: 50
  },
});


AppRegistry.registerComponent("RWpodPlayer", () => RWpodPlayer);
