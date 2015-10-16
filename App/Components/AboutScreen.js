/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  Text,
  View,
  StyleSheet
} = React;

class AboutScreen extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <View>
        <Text>About</Text>
      </View>
    );
  }

}



var styles = StyleSheet.create({

});



module.exports = AboutScreen;
