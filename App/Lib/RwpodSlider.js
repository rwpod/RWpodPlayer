/**
 * @flow
 */

"use strict";

var React = require("react-native");
var {
  StyleSheet,
  View,
  requireNativeComponent
} = React;

class RwpodSliderView extends React.Component {

  constructor(props) {
    super(props);
    // binds
    this._onValueChange = this._onValueChange.bind(this);
  }

  _onValueChange(event: Event) {
    this.props.onChange && this.props.onChange(event);
    if (event.nativeEvent.continuous) {
      this.props.onValueChange &&
        this.props.onValueChange(event.nativeEvent.value);
    } else {
      this.props.onSlidingComplete && event.nativeEvent.value !== undefined &&
        this.props.onSlidingComplete(event.nativeEvent.value);
    }
  }

  render() {
    return (
      <RwpodSlider
        style={[styles.slider, this.props.style]}
        value={this.props.value}
        maximumValue={this.props.maximumValue}
        minimumValue={this.props.minimumValue}
        minimumTrackTintColor={this.props.minimumTrackTintColor}
        maximumTrackTintColor={this.props.maximumTrackTintColor}
        onChange={this._onValueChange}
      />
    );
  }
}

RwpodSliderView.propTypes = {
  style: View.propTypes.style,
  value: React.PropTypes.number,
  minimumValue: React.PropTypes.number,
  maximumValue: React.PropTypes.number,
  minimumTrackTintColor: React.PropTypes.string,
  maximumTrackTintColor: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
  onSlidingComplete: React.PropTypes.func
};

var styles = StyleSheet.create({
  slider: {
    height: 40,
  }
});

var RwpodSlider = requireNativeComponent('RwpodSlider', RwpodSliderView);

module.exports = RwpodSliderView;
