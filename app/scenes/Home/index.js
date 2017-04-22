/* @flow */
import * as firebase from 'firebase'

import { InteractionManager, Platform, StatusBar, StyleSheet, View, Image, Text, LayoutAnimation } from 'react-native'
import React, { Component } from 'react'

import type { Challenge } from '../../typedef'
import Cover from '../ChallengeDetail/Cover'
// import I18n from 'react-native-i18n'
import MapView from 'react-native-maps'
import colors from 'material-colors'
import map from 'lodash/map'
import plusIcon from '../../images/ic_add_white_24dp.png'
import searchIcon from '../../images/ic_search_black_24dp.png'
import Toast from '@remobile/react-native-toast'
import I18n from 'react-native-i18n'
import MarkerView from './Marker'
const icons = {
  garbage: require('../../images/icon_garbage.png'),
  fun: require('../../images/icon_fun.png'),
  deeds: require('../../images/icon_good_deed.png')

}
const categoryColors = {
  garbage: 'rgba(129,199,132,.25)',
  fun: 'rgba(255,224,130,.25)',
  deeds: 'rgba(240,98,146,.25)'
}

type PropsType = {
  navigator: Object
}

type StateType = {
  challenges: Array<Challenge>,
  region: Object
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
        topBarElevationShadowEnabled: false,
        selectedChallenge: {}
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
    region: new MapView.AnimatedRegion({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    })
  }

  componentDidMount () {
    StatusBar.setBarStyle('dark-content', true)

    InteractionManager.runAfterInteractions(() => {
      this.loadChallenges()
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
    this.props.navigator.showModal({ screen: 'TAKE_PICTURE' })
  }

  // Open challenge detail
  onChallengePress (challenge: Challenge): void {
    const navigatorStyle: Object = {
      navBarButtonColor: colors.white
    }
    let title = null
    // let topTabs = null
    if (Platform.OS === 'android') {
      navigatorStyle.screenBackgroundColor = colors.white
      navigatorStyle.collapsingToolBarComponent = 'COVER'
      navigatorStyle.collapsingToolBarCollapsedColor = colors.cyan['500']
      navigatorStyle.collapsingToolBarExpendedColor = 'transparent'
      navigatorStyle.topBarElevationShadowEnabled = false
      navigatorStyle.showTitleWhenExpended = false
      navigatorStyle.showSubtitleWhenExpended = false
      navigatorStyle.navBarTextColor = colors.white
      title = challenge.name
      /*
      navigatorStyle.navBarHideOnScroll = false
      navigatorStyle.topBarCollapseOnScroll = true
      navigatorStyle.expendCollapsingToolBarOnTopTabChange = false
      navigatorStyle.collapsingToolBarComponentHeight = 360
      topTabs = [{
        screenId: 'CHALLENGE_DETAIL',
        title: I18n.t('detail'),
        passProps: { challenge }
      }, {
        screenId: 'CHALLENGE_MESSAGES',
        title: I18n.t('messages'),
        passProps: { challenge }
      }]
      */
    } else {
      navigatorStyle.navBarTranslucent = true
      navigatorStyle.drawUnderNavBar = true
    }
    if (true) {
      this.state.region.setValue({
        ...challenge.location,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121
      })
      this.setState({
        selectedChallenge: challenge,
      })
      return
    }

    Cover.setProps(challenge)
    this.props.navigator.showModal({
      screen: 'CHALLENGE_DETAIL',
      navigatorStyle,
      title,
      // topTabs,
      passProps: { challenge }
    })
  }

  loadChallenges () {
    firebase
    .database()
    .ref('/challenges')
    .on('value', (snapshot) => {
      Toast.showLongBottom(I18n.t('challenges_updated'))
      this.setState({ challenges: snapshot.val() })
    })
  }

  // Update region on user geolocation change
  updateRegion (newRegion: Object): void {
    this.setState({ region: { ...this.state.region, ...newRegion } })
  }

  render () {
    return (
      <View style={styles.container}>
        <MapView.Animated
          style={styles.map}
          region={this.state.region}>
          {
            map(this.state.challenges, (challenge) => (
              <MapView.Marker
                key={challenge.id}
                onPress={this.onChallengePress.bind(this, challenge)}
                coordinate={{ latitude: challenge.location.latitude, longitude: challenge.location.longitude }}>
                    <MarkerView
                      challenge={challenge}
                      selectedChallengeId={this.state.selectedChallenge && this.state.selectedChallenge.id} />
              </MapView.Marker>
            ))
          }
          {this.state.selectedChallenge
          ? (
            <MapView.Circle
                center={this.state.selectedChallenge.location}
                radius={this.state.selectedChallenge.location.radiusInMeters}
                fillColor={categoryColors[this.state.selectedChallenge.category]}
                strokeWidth={0} />
          ) : null}
        </MapView.Animated>
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
