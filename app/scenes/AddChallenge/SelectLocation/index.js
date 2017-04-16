/* @flow */
import * as firebase from 'firebase'
import colors from 'material-colors'
import { Text, Spinner } from 'native-base'
import React, { Component } from 'react'
import { Platform, Slider, StyleSheet, View, TouchableOpacity } from 'react-native'
import I18n from 'react-native-i18n'
import MapView from 'react-native-maps'
import Toast from '@remobile/react-native-toast'
import Icon from 'react-native-vector-icons/Ionicons'
import RNFS from 'react-native-fs'
import ObjectId from 'bson-objectid'
import doneIcon from '../../../images/ic_save_white_24dp.png'
import Auth from '../../../auth'

type Region = {
  latitude: number,
  longitude: number,
  latitudeDelta?: number,
  longitudeDelta?: number
}

type StateType = {
  region: Region,
  selectedLocationRadius: number,
  selectedLocation: Object,
  progress: boolean
}

type PropsType = {
  navigator: Object,
  challengeData: Object
}

class SelectLocationScreen extends Component<void, PropsType, StateType> {
  static navigatorStyle = {
    ...Platform.select({
      ios: {
        drawUnderNavBar: true,
        navBarHidden: true
      },
      android: {
        navBarTranslucent: true,
        navBarTransparent: true,
        navBarButtonColor: 'red',
        drawUnderNavBar: true,
        topBarElevationShadowEnabled: false
      }
    })
  }

  static navigatorButtons = {
    fab: {
      collapsedId: 'save_challenge',
      collapsedIcon: doneIcon,
      backgroundColor: colors.red['500']
    }
  }

  state = {
    position: {},
    progress: false,
    selectedLocation: {
      latitude: 37.78825,
      longitude: -122.4324
    },
    selectedLocationRadius: 50,
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    }
  }

  // Update map and set selected location
  onMapPress ({ coordinate }: { coordinate: Object }): void {
    // console.log('map press', coordinate)
    this.setState({
      selectedLocation: coordinate,
      region: { ...this.state.region, ...coordinate }
    })
  }

  // Display error message
  showMessage (message: string): void {
    if (Platform.OS === 'ios') {
      console.log(message)
      Toast.showLongBottom(message)
    } else {
      this.props.navigator.showSnackbar({ text: message })
    }
  }

  // Submit challenge to firebase
  saveChallenge (photoUrl: string): Promise<any> {
    return Auth.getProfile()
    .then((profile) => {
      const oid = ObjectId().toString()
      if (!profile) {
        return Promise.resolve(true)
      }
      return firebase.database()
      .ref(`challenges/${oid}`)
      .set({
        ...this.props.challengeData,
        createdBy: profile.id,
        id: oid,
        photo: photoUrl,
        location: {
          ...this.state.selectedLocation,
          radiusInMeters: this.state.selectedLocationRadius
        }
      })
    })
  }

  // Update challenge radius
  updateChallengeRadius (radius: number): void {
    this.setState({ selectedLocationRadius: radius })
  }

  // Upload challenge photo if provided
  uploadPhoto (): Promise<string> {
    if (!this.props.challengeData.photo) {
      return Promise.resolve('')
    } else {
      const uri = this.props.challengeData.photo.replace('file://', '') // RNFetchBlob.wrap()
      const urlParts = this.props.challengeData.photo.split('/')
      const photoName = urlParts[urlParts.length - 1]
      const imageRef = firebase.storage().ref().child(`photos/${Date.now()}-${photoName}`)

      // console.log('uri ', uri, 'photo naem', photoName)

      return RNFS.readFile(uri, 'base64')
      .then((data) => {
        // console.log('have data rnfs', typeof data, data.length)
        const payload = data.replace(/(\r\n|\n|\r)/gm, '').trim()
        return imageRef.putString(payload, 'base64')
      })
      .then((snapshot) => {
        // console.log('upload done', imageRef.getDownloadURL())
        return imageRef.getDownloadURL()
      })
      .catch((err) => {
        console.log(err)
        this.showMessage(I18n.t('photo_upload_failed'))
        return ''
      })
    }
  }

  // Save challenge and show challenge added modal
  onConfirmPress (): void {
    const screen = {
      screen: 'CHALLENGE_ADDED',
      style: {
        backgroundBlur: 'dark'
      }
    }
    this.setState({ progress: true })
    this.uploadPhoto()
    .then((photoUrl: string) => {
      return this.saveChallenge(photoUrl)
    })
    .then(() => {
      this.setState({ progress: false })
      if (Platform.OS === 'ios') {
        this.props.navigator.dismissLightBox()
        this.props.navigator.showLightBox(screen)
      } else {
        this.props.navigator.showModal(screen)
      }
    })
    .catch((err) => {
      this.setState({ progress: false })
      this.showMessage(err.message)
    })
  }

  // Got to previous screen
  goBack () {
    this.props.navigator.dismissModal()
  }

  renderBottomNavigation (): View {
    return (
      <View style={styles.bottomRow}>
        <View style={{ borderRadius: 2, elevation: 4, paddingVertical: 8 }}>
          <Text style={{ backgroundColor: 'transparent' }}>
            {I18n.t('area_radius')} {this.state.selectedLocationRadius}m
          </Text>
          <Slider
            style={{ width: 200 }}
            step={5}
            maximumValue={1000}
            minimumValue={10}
            onSlidingComplete={this.updateChallengeRadius.bind(this)} />
        </View>
        <View style={{ }}>
          <TouchableOpacity
            onPress={this.onConfirmPress.bind(this)}
            style={styles.confirmPhotoButton}
            hitSlop={{ left: 35, right: 35, top: 35, bottom: 35 }}>
            <Icon
              color={colors.cyan['500']}
              size={60}
              name='ios-checkmark-circle-outline' />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Render undo button
  renderUndoButton (): TouchableOpacity {
    return (
      <TouchableOpacity
        onPress={this.goBack.bind(this)}
        style={styles.backButton}
        hitSlop={{ left: 35, right: 35, top: 35, bottom: 35 }}>
        <Icon
          color={colors.cyan['500']}
          size={32}
          name='ios-undo' />
      </TouchableOpacity>
    )
  }

  // Render progress spinner
  renderProgress (): View {
    return (
      <View style={styles.progressContainer}>
        <Spinner color={colors.cyan['500']} />
      </View>
    )
  }

  render (): View {
    return (
      <View style={styles.container}>
        <MapView
          onPress={(data) => this.onMapPress(data.nativeEvent)}
          style={styles.map}
          region={this.state.region}>
          <MapView.Circle
            center={this.state.selectedLocation}
            radius={this.state.selectedLocationRadius}
            fillColor={'#333'}
            strokeWidth={0} />
          <MapView.Marker
            coordinate={this.state.selectedLocation} />
        </MapView>
        {this.state.progress
        ? this.renderProgress()
        : ([
          this.renderUndoButton(),
          this.renderBottomNavigation()
        ])}

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  progressContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    paddingHorizontal: 16
  },
  backButton: {
    position: 'absolute',
    top: 25,
    left: 15,
    backgroundColor: 'transparent'
  },
  confirmPhotoButton: {
    backgroundColor: 'transparent'
  }
})

export default SelectLocationScreen
