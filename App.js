import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { KeepAwake, Camera, Permissions, Gyroscope } from 'expo';
import { RNS3 } from 'react-native-aws3';
import { STORE_URL, STORE_KEY } from 'react-native-dotenv';

KeepAwake.deactivate();

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    capturing: false,
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  snap = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync();
      const photoExt = /\.[a-z]+$/i.exec(photo.uri)[0].substring(1);

      const formData = new FormData();
      formData.append('filetype', photoExt);
      formData.append('image', {
        uri: photo.uri,
        name: `${Date.now()}.${photoExt}`,
        type: 'multipart/form-data',
      });

      try {
        const res = await fetch(STORE_URL, {
          method: 'POST',
          headers: {
            Authorization: STORE_KEY,
          },
          body: formData,
        });
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    }
  };

  toggle = () => {
    if (this.state.capturing) {
      KeepAwake.deactivate();
      clearInterval(this.snapInterval);
      this.setState({ capturing: false });
    } else {
      KeepAwake.activate();
      this.snapInterval = setInterval(this.snap, 5000);
      this.setState({ capturing: true });
    }
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Please enable camera permission!</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            ratio="16:9"
            type={Camera.Constants.Type.back}
            ref={c => (this.camera = c)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  width: '40%',
                  height: 50,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: this.state.capturing ? '#f00' : '#0f0',
                  borderRadius: 4,
                }}
                onPress={this.toggle}
              >
                <Text style={{ fontSize: 18, marginBottom: 10 }}>
                  {this.state.capturing ? 'Stop' : 'Start'} Capturing
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
