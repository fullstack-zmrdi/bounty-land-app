import { Text } from 'native-base'
import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native'
import Camera from 'react-native-camera'
import I18n from 'react-native-i18n'
import colors from 'material-colors'
import Icon from 'react-native-vector-icons/Ionicons'

class TakePicture extends Component {
  takePicture () {
    const options = {}
    // options.location = ...
    this.camera.capture({ metadata: options })
      .then((data) => console.log(data))
      .catch(err => console.error(err))
  }

  addChallengeDetails () {
    const screen = {
      screen: 'ADD_CHALLENGE',
      passProps: {
        selectLocation: (challengeData) => this.props.navigator.dismissAllModals()
      },
      style: {
        backgroundBlur: 'dark'
      }
    }
    if (Platform.OS === 'ios'){
      this.props.navigator.showLightBox(screen)
    } else {
      this.props.navigator.showModal(screen)
    }
  }

  showCameraRoll () {
    this.props.navigator.showModal({
      screen: 'CAMERA_ROLL'
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam
          }}
          captureAudio={false}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}>
          <View style={{ flexDirection: 'row', height: 80, alignItems: 'center', justifyContent: 'space-around', position: 'absolute', left: 0, bottom: 0, right: 0 }}>
            <TouchableOpacity onPress={this.addChallengeDetails.bind(this)} style={{ backgroundColor: 'transparent' }}>
              <Text style={{ color: colors.white }}>{I18n.t('skip').toUpperCase()}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.takePicture.bind(this)} style={{ alignSelf: 'center', width: 50, height: 50, backgroundColor: 'transparent', borderRadius: 25, borderWidth: 1, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <Icon color={colors.white} size={32} name='ios-camera-outline' />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.showCameraRoll.bind(this)}>
              <Text>test</Text>
            </TouchableOpacity>
          </View>

        </Camera>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
})

export default TakePicture
