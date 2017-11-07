import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { KeepAwake, Camera, Permissions } from 'expo';
import { RNS3 } from 'react-native-aws3';

KeepAwake.activate();
const AWS_OPTIONS = {
  bucket: 'dodo-test-bucket',
  region: 'ap-southeast-1',
  accessKey: 'AKIAJ65KQ7YMZKWOORVQ',
  secretKey: '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',
};

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  snap = async () => {
    if (this.camera) {
      console.log('hello');
      const photo = await this.camera.takePictureAsync();
      const photoExt = /\.[a-z]+$/i.exec(photo.uri)[0].substring(1);
      const file = {
        uri: photo.uri,
        name: `${Date.now()}.${photoExt}`,
        type: `image/${photoExt}`,
      };
      try {
        const res = await RNS3.put(file, AWS_OPTIONS);
        console.log(res);
      } catch (e) {
        console.log(e);
      }
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
                  width: '30%',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 4,
                }}
                onPress={this.snap}
              >
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Capture</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
