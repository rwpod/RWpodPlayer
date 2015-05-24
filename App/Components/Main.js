"use strict";

var React = require("react-native");
var {
  Text,
  View,
  StyleSheet
} = React;

var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  }
});

class Main extends React.Component {
  render () {
    return (
      <View style={styles.mainContainer}>
        <Text>Testing the Route</Text>
      </View>
    );
  }
}

module.exports = Main;
