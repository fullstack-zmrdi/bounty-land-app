/* @flow */
import * as firebase from 'firebase'
import map from 'lodash/map'
import colors from 'material-colors'
import React, { Component } from 'react'
import { InteractionManager, Platform, StyleSheet, View } from 'react-native'
import I18n from 'react-native-i18n'
import MapView from 'react-native-maps'

import plusIcon from '../../images/ic_add_white_24dp.png'
import searchIcon from '../../images/ic_search_black_24dp.png'
import type { Challenge } from '../../typedef'

type PropsType = {
  navigator: Object
}

type StateType = {
  challenges: Array<Challenge>
}

class Home extends Component<void, PropsType, StateType> {
  static navigatorStyle = {
    ...Platform.select({
      ios: {
        navBarBlur: true,
        drawUnderNavBar: true,
        navBarTransparent: true
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
    ...Platform.select({
      ios: {
        rightButtons: [{
          id: 'add_challenge',
          icon: require('../../images/ios_add.png'),
          title: 'add_challenge',
          hint: 'ttest',
          label: 'test'
        }]
      },
      android: {
        fab: {
          collapsedId: 'add_challenge',
          collapsedIcon: plusIcon,
          backgroundColor: colors.red['500']
        },
        leftButtons: [{
          id: 'sideMenu'
        }],
        rightButtons: [{
          id: 'searchView',
          icon: searchIcon,
          hint: 'search_challenges'
        }]
      }
    })
  }

  state = {
    position: {},
    selectLocation: false,
    challengeData: {},
    selectedLocation: {
      latitude: 37.78825,
      longitude: -122.4324
    },
    selectedLocationRadius: 50,
    challenges: [],
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    }
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      firebase.database().ref('/challenges').on('value', (snapshot) => {
        this.setState({ challenges: snapshot.val() })
      })
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
      /*
       navigator.geolocation.getCurrentPosition((pos) => {
       console.log(pos)
       this.setState({ position: pos })
       }, error => console.error(error), { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 })
       */
    })
  }

  // Handle navigator event
  onNavigatorEvent (event: Object): void {
    // console.log(event)
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'add_challenge') {
        this.onAddChallengePress()
      }
    }
  }

  // Open camera to take picture for new challenge
  onAddChallengePress (): void {
    this.props.navigator.showModal({
      screen: 'TAKE_PICTURE',
      navigatorStyle: {
        navBarHidden: true
      },
      passProps: {}
    })
  }

  // Update region on user geolocation change
  updateRegion (newRegion: Object): void {
    this.setState({ ...this.state.region, newRegion })
  }

  // Open challenge detail
  onChallengePress (challenge: Challenge): void {
    this.props.navigator.showModal({
      screen: 'CHALLENGE_DETAIL',
      passProps: { challenge },
      title: challenge.name
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}>
          {
            map(this.state.challenges, (challenge) => (
              <MapView.Marker
                onPress={this.onChallengePress.bind(this, challenge)}
                coordinate={{ latitude: challenge.location.latitude, longitude: challenge.location.longitude }}
                title={challenge.name}
                description={challenge.description} />
            ))
          }
        </MapView>
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
  map: {
    ...StyleSheet.absoluteFillObject
  }
})

export default Home
