/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  View,
  WebView,
  StyleSheet
} = React;

var CHAT_URL = 'https://gitter.im/rwpod/public';
var SCRIPT_INJECT = 'var element = document.getElementById("login-footer"); element.parentNode.removeChild(element);';

class ChatScreen extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.chatContainer}>
        <WebView
          ref="webview"
          automaticallyAdjustContentInsets={false}
          bounces={false}
          style={styles.webContainer}
          javaScriptEnabledAndroid={true}
          shouldInjectAJAXHandler={false}
          startInLoadingState={true}
          url={CHAT_URL}
          injectedJavaScript={SCRIPT_INJECT}
        />
      </View>
    );
  }

}



var styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#E2DBCB"
  },
  webContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  }
});



module.exports = ChatScreen;
