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

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Text>
          About
        </Text>
      </View>
    );
  }

}



var styles = StyleSheet.create({

});



module.exports = AboutScreen;
