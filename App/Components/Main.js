"use strict";

var React = require("react-native");
var {
  Text,
  View,
  StyleSheet,
  TabBarIOS
} = React;
var Podcasts = require("./Podcasts")


class Main extends React.Component {
  static title: "<TabBarIOS>";
  static description: "Tab-based navigation";

  constructor (props) {
    super(props);
    this.state = {
      selectedTab: 'blueTab',
      notifCount: 0,
      presses: 0
    }
  }

  _renderPodcasts () {
    return (
      <Podcasts />
    )
  }

  _renderContent (color: string, pageText: string) {
    return (
      <View style={[styles.tabContent, {backgroundColor: color}]}>
        <Text style={styles.tabText}>{pageText}</Text>
        <Text style={styles.tabText}>{this.state.presses} re-renders of the More tab</Text>
      </View>
    );
  }

  render () {
    return (
      <TabBarIOS>
        <TabBarIOS.Item
          systemIcon="featured"
          selected={this.state.selectedTab === 'blueTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'blueTab',
            });
          }}>
          {this._renderPodcasts()}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          systemIcon="history"
          badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
          selected={this.state.selectedTab === 'redTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'redTab',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          {this._renderContent('#783E33', 'Red Tab')}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          systemIcon="more"
          selected={this.state.selectedTab === 'greenTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'greenTab',
              presses: this.state.presses + 1
            });
          }}>
          {this._renderContent('#21551C', 'Green Tab')}
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}


var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: "center"
  },
  tabText: {
    color: "white",
    margin: 50
  },
});


module.exports = Main;
