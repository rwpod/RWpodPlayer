/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  LinkingIOS,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableHighlight
} = React;
var ViewSubscriber = require('../Lib/ViewSubscriber');
var Device = require("../Lib/Device");

class AboutScreen extends React.Component {

  constructor(props, context) {
    super(props, context);
    // binds
    this.getState = this.getState.bind(this);
    this._changedOrientation = this._changedOrientation.bind(this);
    // state
    this.state = this.getState(Device)
  }

  getState(dimensions) {
    return {
      width: dimensions.width,
      height: dimensions.height
    }
  }

  _changedOrientation(dimensions: Object) {
    this.setState(this.getState(dimensions));
  }

  componentDidMount() {
    this.viewSubscriber = new ViewSubscriber();
    this.viewSubscriber.initViewport(this._changedOrientation);
  }

  componentWillUnmount() {
    this.viewSubscriber.remove();
  }

  _onClickButton(url) {
    LinkingIOS.canOpenURL(url, (supported) => {
      if (!supported) {
        AlertIOS.alert('Can\'t handle url: ' + url);
      } else {
        LinkingIOS.openURL(url);
      }
    });
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.headContainer}>
          <Text style={styles.headTitle}>RWpod Player</Text>
          <Text numberOfLines={5} style={[styles.describeText, {width: this.state.width}]}>
            Данное приложение сделано для того, что бы проверить, что может React Native. Но возможно оно поможет Вам послушать подкаст RWpod
          </Text>
        </View>
        {this.state.width < this.state.height && this.state.height > 600 && <View style={styles.imageContainer}>
          <Image
            style={styles.logo}
            source={require('image!AboutLogo')}
          />
        </View>}
        <View style={styles.buttonsContainer}>
          <TouchableHighlight onPress={this._onClickButton.bind(this, "http://www.rwpod.com")} underlayColor={"#CCCCCC"} style={[styles.button, {width: (this.state.width - 20)}]}>
            <Text style={styles.buttonTitle}>RWpod сайт</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._onClickButton.bind(this, "https://github.com/rwpod/RWpodPlayer")} underlayColor={"#CCCCCC"} style={[styles.button, {width: (this.state.width - 20)}]}>
            <Text style={styles.buttonTitle}>Исходники</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

}



var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 65,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headTitle: {
    fontSize: 26,
    marginBottom: 20,
  },
  describeText: {
    fontSize: 16,
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
  },
  buttonsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderColor: "#303030",
    shadowColor: "#CCCCCC",
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    margin: 5,
  },
  buttonTitle: {
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: "center",
  }
});



module.exports = AboutScreen;
