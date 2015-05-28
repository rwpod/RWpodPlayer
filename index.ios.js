"use strict";

var React = require("react-native");
var {
  AppRegistry,
  NavigatorIOS,
  TabBarIOS,
  StyleSheet
} = React;
var Podcasts = require("./App/Components/Podcasts");


class RWpodPlayer extends React.Component {
  static title: "<TabBarIOS>";
  static description: "Tab-based navigation";

  constructor (props) {
    super(props);
    /* binds*/
    this._renderPodcasts = this._renderPodcasts.bind(this);
    this._selectTab = this._selectTab.bind(this);
    this._renderPodcasts = this._renderPodcasts.bind(this);
    /* state */
    this.state = {
      selectedTab: 'podcasts'
    }
  }

  _renderPodcasts () {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          component: Podcasts,
          title: "Podcasts"
        }}
      />
    )
  }

  render () {
    return (
      <TabBarIOS>
        <TabBarIOS.Item
          systemIcon="featured"
          selected={this.state.selectedTab === 'podcasts'}
          onPress={() => this._selectTab('podcasts')}>
          {this._renderPodcasts()}
        </TabBarIOS.Item>
      </TabBarIOS>
    );
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
    backgroundColor: "#111111"
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
