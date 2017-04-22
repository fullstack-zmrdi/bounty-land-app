/* @flow */
import { Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { Component } from 'react'

import Camera from 'react-native-camera'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Ionicons'
import { Text } from 'native-base'
import colors from 'material-colors'
import { iconsMap } from '../../../images/Icons'

type PropsType = {
  navigator: Object
}

type StateType = {
  photo: ?{ path: string },
  photoTaken: boolean,
  cameraType: string
}

class TakePicture extends Component<void, PropsType, StateType> {
  camera: Camera;
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true,
    navBarButtonColor: colors.white,
    screenBackgroundColor: colors.black
  }

  state = {
    photoTaken: false,
    photo: null,
    cameraType: Camera.constants.Type.back
  }

  reverseCameraButton = {
    id: 'reverse-camera',
    icon: iconsMap['ios-reverse-camera'],
    color: colors.white
  }

  componentDidMount (): void {
    StatusBar.setHidden(true)
    this.showBackButton()
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
  }

  // Handle navigator event
  onNavigatorEvent (event: Object): void {
    if (event.id === 'back') {
      this.props.navigator.dismissModal()
    }

    if (event.id === 'undo') {
      this.takeAnotherPhoto()
    }

    if (event.id === 'reverse-camera') {
      this.toggleCamera()
    }
  }

  // Show back button in nav bar
  showBackButton (): void {
    this.props.navigator.setButtons({
      leftButtons: [{
        id: 'back',
        color: colors.white,
        icon: iconsMap['ios-arrow-back']
      }],
      rightButtons: [this.reverseCameraButton]
    })
  }

  // Show undo button in navbar
  showUndoButton (): void {
    this.props.navigator.setButtons({
      leftButtons: [{
        id: 'undo',
        color: colors.white,
        icon: iconsMap['ios-undo']
      }],
      rightButtons: [this.reverseCameraButton]
    })
  }

  // Take picture with camera
  takePicture (): void {
    const options = {}
    // options.location = ...
    this.camera.capture({ metadata: options })
    .then((data) => {
      // console.log(data)
      this.showUndoButton()
      this.setState({ photo: data, photoTaken: true })
    })
    .catch((err) => console.error(err))
  }

  // Confirm taken photo and continue to next screen
  // TODO: Upload photo to server
  onConfirmPhotoPress (): void {
    const screen = {
      screen: 'ADD_CHALLENGE',
      passProps: {},
      style: {
        backgroundBlur: 'dark'
      }
    }

    if (this.state.photo) {
      screen.passProps.photoPath = this.state.photo.path
    }

    if (Platform.OS === 'ios') {
      this.props.navigator.showLightBox(screen)
    } else {
      this.props.navigator.showModal(screen)
    }
  }

  // Show camera roll
  // TODO: implement camera roll view
  showCameraRoll (): void {
    this.props.navigator.showModal({
      screen: 'CAMERA_ROLL'
    })
  }

  // Take new photo
  takeAnotherPhoto (): void {
    this.showBackButton()
    this.setState({
      photoTaken: false,
      photo: null
    })
  }

  // Toggle camera front <-> back
  toggleCamera (): void {
    const cameraType = this.state.cameraType === Camera.constants.Type.back
    ? Camera.constants.Type.front
    : Camera.constants.Type.back
    this.setState({ cameraType })
  }

  // Display taken photo and controls to continue/take another
  renderTakenPhoto (): View {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: this.state.photo && this.state.photo.path }}
          style={{ flex: 1, resizeMode: 'cover' }} />
        <TouchableOpacity
          onPress={this.onConfirmPhotoPress.bind(this)}
          style={styles.confirmPhotoButton}>
          <Icon
            color={colors.white}
            size={60}
            name='ios-checkmark-circle-outline' />
        </TouchableOpacity>
      </View>
    )
  }

  // Render camera controls
  renderCameraControls (): View {
    return (
      <View style={styles.cameraControlsRow}>
        <TouchableOpacity
          onPress={this.onConfirmPhotoPress.bind(this)}
          style={{ backgroundColor: 'transparent' }}>
          <Text style={{ color: colors.white }}>
            {I18n.t('skip').toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.takePicture.bind(this)}
          style={styles.takePicButton}>
          <Icon
            color={colors.white}
            size={32}
            name='ios-camera-outline' />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: 'transparent' }}
          /* onPress={this.showCameraRoll.bind(this)} */>
          <Icon
            color={colors.white}
            size={24}
            name='ios-folder' />
        </TouchableOpacity>
      </View>
    )
  }

  // Render camera
  renderCamera (): Camera {
    return (
      <Camera
        ref={(cam) => { this.camera = cam }}
        captureAudio={false}
        type={this.state.cameraType}
        captureTarget={Camera.constants.CaptureTarget.disk}
        style={styles.preview}
        aspect={Camera.constants.Aspect.fill}>
        {this.renderCameraControls()}
      </Camera>
    )
  }

  render (): View {
    return (
      <View style={styles.container}>
        {this.state.photoTaken && this.state.photo
        ? (
          this.renderTakenPhoto()
        ) : (
          this.renderCamera()
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black'
  },
  cameraControlsRow: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0
  },
  takePicButton: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginBottom: 15
  },
  takeAnotherPhotoButton: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 15,
    top: 15
  },
  confirmPhotoButton: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center'
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
