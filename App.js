import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  CameraRoll,
} from 'react-native';
import {
  KeepAwake,
  Camera,
  Permissions,
  takeSnapshotAsync,
  Location,
  FileSystem,
} from 'expo';
import { STORE_URL, STORE_KEY } from 'react-native-dotenv';

KeepAwake.deactivate();

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    capturing: false,
    heading: null,
    uri: '',
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  snap = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync();

      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
      const heading = await Location.getHeadingAsync();

      if (this.state.heading && this.state.uri) {
        const photoExt = /\.[a-z]+$/i.exec(this.state.uri)[0].substring(1);
        const fileName = `${location.coords.speed}-${heading.trueHeading -
          this.state.heading}-${location.coords.accuracy}-${
          heading.accuracy
        }.${photoExt}`;
        try {
          await FileSystem.moveAsync({
            from: this.state.uri,
            to: `${FileSystem.cacheDirectory}${fileName}`,
          });
          await CameraRoll.saveToCameraRoll(
            `${FileSystem.cacheDirectory}${fileName}`,
            'photo',
          );
        } catch (e) {
          console.error(e);
        }
      }

      this.setState({ uri: photo.uri, heading: heading.trueHeading });

      //   const formData = new FormData();
      //   formData.append('filetype', photoExt);
      //   formData.append('image', {
      //     uri: photo.uri,
      //     name: `${Date.now()}.${photoExt}`,
      //     type: 'multipart/form-data',
      //   });

      //   try {
      //     const res = await fetch(STORE_URL, {
      //       method: 'POST',
      //       headers: {
      //         Authorization: STORE_KEY,
      //       },
      //       body: formData,
      //     });
      //     console.log(res);
      //   } catch (e) {
      //     console.log(e);
      //   }
    }
  };

  toggle = async () => {
    if (this.state.capturing) {
      KeepAwake.deactivate();
      clearInterval(this.snapInterval);
      this.setState({ capturing: false });
    } else {
      KeepAwake.activate();
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      console.log(status);
      if (status !== 'granted') return;
      const cameraPerm = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      const camStatus = cameraPerm.status;
      if (camStatus !== 'granted') return;
      try {
        this.snapInterval = setInterval(this.snap, 1000);
        this.setState({ capturing: true });
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
