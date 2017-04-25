/* @flow */
import * as firebase from 'firebase'

import { Platform, StatusBar, StyleSheet, Image, View, Text, /* LayoutAnimation, */ ActivityIndicator, Animated } from 'react-native'
import React, { Component } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { H3 } from 'native-base'
import type { Challenge } from '../../typedef'
import { themeColors, categoryColors } from '../../theme'
import Cover from '../ChallengeDetail/Cover'
// import I18n from 'react-native-i18n'
import MapView from 'react-native-maps'
import colors from 'material-colors'
import map from 'lodash/map'
import plusIcon from '../../images/ic_add_white_24dp.png'
// import searchIcon from '../../images/ic_search_black_24dp.png'
import Toast from '@remobile/react-native-toast'
import I18n from 'react-native-i18n'
import MarkerView from './Marker'
import {iconsMap} from '../../images/Icons'
import Geofire from 'geofire'
import Swiper from 'react-native-swiper'
import Icon from 'react-native-vector-icons/Ionicons'

type PropsType = {
  navigator: RnNavigator
}

type StateType = {
  challenges: { [key: string]: Challenge},
  region: Object,
  userLatLng: ?{ latitude: number, longitude: number },
  selectedChallenge: ?Challenge,
  swiperPosition: Animated.Value
}

class Home extends Component<void, PropsType, StateType> {
  geofire: Geofire;
  swiper: Swiper;
  static navigatorStyle = {
    ...Platform.select({
      ios: {
        navBarBlur: true,
        drawUnderNavBar: true,
        navBarTransparent: true
      },
      android: {
        navBarTransparent: true,
        drawUnderNavBar: true,
        topBarElevationShadowEnabled: false,
        navBarButtonColor: colors.black
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
      android: {}
    })
  }
  state = {
    selectedChallenge: null,
    userLatLng: null,
    challenges: {},
    swiperPosition: new Animated.Value(-220),
    region: new MapView.AnimatedRegion({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    })
  }

  componentDidMount (): void {
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.getCurrentPosition()
    .then((coords) => {
      this.loadChallenges(coords)
    })
  }

  componentWillUpdate (): void {
    // LayoutAnimation.easeInEaseOut()
  }

  // Handle navigator event
  onNavigatorEvent (event: Object): void {
    // console.log(event)
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'add_challenge') {
        this.onAddChallengePress()
      }
      if (event.id === 'locate_me') {
        this.onLocateMePress()
      }
    }
  }

  // Center map to user position
  onLocateMePress (): void {
    // this.setGeofire()
    if (!this.state.userLatLng) {
      return
    }
    this.setState({
      region: new MapView.AnimatedRegion({
        ...this.state.userLatLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121
      })
    })
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

    if (this.state.selectedChallenge && this.state.selectedChallenge.id === challenge.id) {
      Cover.setProps(challenge)
      this.props.navigator.showModal({
        screen: 'CHALLENGE_DETAIL',
        navigatorStyle,
        title,
        // topTabs,
        passProps: { challenge }
      })
    } else {
      let scrollBy = 0
      const index = Object.keys(this.state.challenges).indexOf(challenge.id)
      scrollBy = index - this.swiper.state.index
      this.swiper.scrollBy(scrollBy)
      this.toggleSwiper(true)
      this.setState({ selectedChallenge: challenge })
    }
  }

  _onMomentumScrollEnd (e, state, context) {
    const challengeId = Object.keys(this.state.challenges)[state.index]
    this.setState({ selectedChallenge: this.state.challenges[challengeId] })
    this.state.region.setValue({
      ...this.state.challenges[challengeId].location,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121
    })
  }

  // Get user current position and et to state
  getCurrentPosition (): Promise<Object> {
    return new Promise((resolve, reject) => {
      navigator.geolocation
        .getCurrentPosition((data) => {
          // console.log('geolocation position', data.coords)
          const latlng = {
            latitude: data.coords.latitude,
            longitude: data.coords.longitude
          }
          this.setButtons()
          this.setState({
            userLatLng: latlng,
            region: new MapView.AnimatedRegion({
              ...latlng,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121
            })
          })
          return resolve(data.coords)
        }, (error) => {
          console.error(error)
          Toast.showLongBottom(I18n.t('get_position_error'))
          return reject(error)
        }, {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 1000
        })
    })
  }

  // Set navigator buttons and status bar style
  setButtons () {
    StatusBar.setBarStyle('dark-content', true)
    if (Platform.OS === 'android') {
      this.props.navigator.setButtons({
        leftButtons: [{
          id: 'sideMenu',
          icon: iconsMap['md-menu'],
          buttonColor: '#000'
        }],
        rightButtons: [{
          id: 'locate_me',
          icon: iconsMap['md-locate']
        }/* , {
          id: 'searchView',
          icon: searchIcon,
          hint: 'search_challenges'
        } */],
        fab: {
          collapsedId: 'add_challenge',
          collapsedIcon: plusIcon,
          backgroundColor: themeColors.primaryColor
        }
      })
    }
  }

  loadChallengeById (id: string): void {
    console.log('load challenge', id)
    const firebaseRef = firebase.database().ref(`challenges/${id}`)
    firebaseRef.once('value', (snapshot) => {
      // console.log('loaded challenge', snapshot.val())
      this.setState({
        challenges: {
          ...this.state.challenges,
          [id]: snapshot.val()
        }
      })
    })
  }

  loadChallenges (coords: Object): void {
    const geoRef = firebase.database().ref()
    this.geofire = new Geofire(geoRef)
    // console.log('load challenges', [coords.latitude, coords.longitude])
    const geoQuery = this.geofire.query({
      center: [coords.latitude, coords.longitude],
      radius: 0.5
    })
    geoQuery.on('key_entered', (key, location, distance) => {
      this.loadChallengeById(key)
      console.log('gf key entered', key, location, distance)
    })

    geoQuery.on('ready', (res) => {
      console.log('gf query ready', res)
    })

    geoQuery.on('key_exited', (key, location, distance) => {
      console.log('gf key exited', key, location, distance)
    })
  }

  // Update region on user geolocation change
  updateRegion (newRegion: Object): void {
    this.setState({ region: { ...this.state.region, ...newRegion } })
  }

  setGeofire () {
    const ref = firebase.database().ref('challenges')
    ref.on('value', (snapshot) => {
      map(snapshot.val(), (item) => {
        console.log('geofire set item', item.id, [item.location.latitude, item.location.longitude])
        this.geofire.set(item.id, [item.location.latitude, item.location.longitude])
      })
    })
  }

  toggleSwiper (visible: bool): void {
    const toValue = visible ? 0 : -220
    const anim = Animated.timing(this.state.swiperPosition, { toValue, duration: 500 })
    anim.start()
  }

  render () {
    if (!this.state.userLatLng) {
      return (
        <LinearGradient
          colors={[themeColors.primaryColor, themeColors.accentColor]}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.white} size={60} />
          <Text style={{ color: colors.white, paddingTop: 30 }}>
            {I18n.t('map_loading')}
          </Text>
        </LinearGradient>
      )
    }
    return (
      <View style={styles.container}>
        <MapView.Animated
          onPress={() => this.toggleSwiper(false)}
          style={styles.map}
          region={this.state.region}>
          {map(this.state.challenges, (challenge) => {
            // console.log('challenge', challenge)
            return (
              <MapView.Marker
                key={challenge.id}
                onPress={this.onChallengePress.bind(this, challenge)}
                coordinate={{ latitude: challenge.location.latitude, longitude: challenge.location.longitude }}>
                <MarkerView
                  challenge={challenge}
                  selectedChallengeId={this.state.selectedChallenge && this.state.selectedChallenge.id} />
              </MapView.Marker>
            )
          })}
          {this.state.selectedChallenge
          ? (
            <MapView.Circle
              center={this.state.selectedChallenge.location}
              radius={this.state.selectedChallenge.location.radiusInMeters}
              fillColor={categoryColors[this.state.selectedChallenge.category]}
              strokeWidth={0} />
          ) : null}
          {this.state.userLatLng
          ? (
            <MapView.Marker
              image={iconsMap['md-locate']}
              coordinate={{
                latitude: this.state.userLatLng.latitude,
                longitude: this.state.userLatLng.longitude
              }} />
          ) : null}
        </MapView.Animated>
        <Animated.View style={{ position: 'absolute', paddingVertical: 16, bottom: this.state.swiperPosition, height: 240, left: 0, right: 0 }}>
          <Swiper
            onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
            ref={(ref) => { this.swiper = ref }}
            loop >
            {map(this.state.challenges, (item) => {
              const challengeLatLng = [item.location.latitude, item.location.longitude]
              const userLatLng = [this.state.userLatLng.latitude, this.state.userLatLng.longitude]
              const distance = Geofire.distance(userLatLng, challengeLatLng)
              return (
                <View style={{ flex: 1, paddingHorizontal: 8, flexDirection: 'column', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, backgroundColor: colors.white, elevation: 3, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                    <Image source={{ uri: item.photo }} style={{ height: 240, position: 'absolute', left: 0, right: 0, resizeMode: 'cover' }} />
                    <LinearGradient colors={[themeColors.primaryColorDark, 'rgba(255,255,255,0)']} style={{ height: 240, paddingVertical: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                      <View style={{ paddingBottom: 8, paddingHorizontal: 16, backgroundColor: themeColors.primaryColorDark, flexDirection: 'row', marginBottom: 16, justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <H3 style={{ color: colors.lightText.primary, fontWeight: 'bold' }}>{item.name}</H3>
                          <Text style={{ color: colors.lightText.secondary }}>{I18n.t(item.category)}</Text>
                        </View>
                        <Text style={{ fontSize: 24, color: colors.white, justifyContent: 'center' }}>
                          <Icon size={24} name='md-navigate' color={colors.white} />
                          {' '}{distance.toFixed(1)}km
                        </Text>
                      </View>
                      <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 16, color: colors.lightText.primary }}>
                          <Text style={{ fontWeight: 'bold' }}>{(item.participants && item.participants.length) || 0}</Text>
                          {' '}
                          {I18n.t('n_participants', {count: (item.participants && item.participants.length) || 0}) }
                        </Text>
                        <Text style={{ fontSize: 16, color: colors.lightText.primary }}>
                          <Text style={{ fontWeight: 'bold' }}>{item.bounty}$</Text>
                          {' '}
                          {I18n.t('total_bounty') }
                        </Text>
                      </View>
                      <Text style={{ paddingHorizontal: 16, color: colors.lightText.secondary }}>{item.description}</Text>
                    </LinearGradient>
                  </View>
                </View>
              )
            })}
          </Swiper>
        </Animated.View>
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
