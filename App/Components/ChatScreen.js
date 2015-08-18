/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  AlertIOS,
  View,
  WebView,
  StyleSheet,
  LinkingIOS
} = React;
var Subscribable = require("Subscribable");


var CHAT_URL = 'https://gitter.im/rwpod/public';
var SCRIPT_INJECT = 'var element = document.getElementById("login-footer"); element.parentNode.removeChild(element);';

class ChatScreen extends React.Component {
  static propTypes: {
    emitter: React.PropTypes.object.idRequired
  };

  constructor(props) {
    super(props);
    /*binds*/
    this._handleOpenChat = this._handleOpenChat.bind(this);
  }

  componentWillMount() {
    /* mixin */
    Subscribable.Mixin.componentWillMount();
  }

  componentDidMount() {
    Subscribable.Mixin.addListenerOn(this.props.emitter, 'openChat', this._handleOpenChat);
  }

  componentWillUnmount() {
    Subscribable.Mixin.componentWillUnmount();
  }

  _handleOpenChat() {
    LinkingIOS.canOpenURL(CHAT_URL, (supported) => {
      if (!supported) {
        AlertIOS.alert('Can\'t handle url: ' + CHAT_URL);
      } else {
        LinkingIOS.openURL(CHAT_URL);
      }
    });
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
    justifyContent: "center",
    backgroundColor: "#E2DBCB"
  }
});



module.exports = ChatScreen;
