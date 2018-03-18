import React, { Component } from 'react';
import { View } from 'react-native';
import { Location, Permissions } from 'expo';

export default class DoDoLocation extends Component {
  state = {
    location: null,
    heading: null,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      this._getLocationAsync();
      this._getHeadingAsync();
    }, 1000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    this.setState({ location });
  };

  _getHeadingAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') return;

    let heading = await Location.getHeadingAsync();
    this.setState({ heading });
  };

  render() {
    console.log(this.state);
    return <View />;
  }
}
