"use strict";

var React = require("react-native");
var {
  AppRegistry,
  NavigatorIOS,
  StyleSheet
} = React;
var Main = require("./App/Components/Main");


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111"
  }
});


class RWpodPlayer extends React.Component {
  render () {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          component: Main,
          title: "RWpod Player"
        }}
      />
    );
  }
}


AppRegistry.registerComponent("RWpodPlayer", () => RWpodPlayer);
