import React from 'react';
import { View } from 'react-native';
import { Magnetometer } from 'expo';

export default class MagnetometerComponent extends React.Component {
  state = {
    MagnetometerData: {},
  };

  componentDidMount() {
    Magnetometer.setUpdateInterval(1000);
    Magnetometer.addListener(result => {
      this.setState({ MagnetometerData: result });
    });
  }

  render() {
    return <View />;
  }
}
