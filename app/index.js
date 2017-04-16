 /* @flow */

import * as firebase from 'firebase'

import Auth from './auth'
import I18n from 'react-native-i18n'
import { Navigation } from 'react-native-navigation'
import { Platform } from 'react-native'
import czechTranslations from './locales/cs'
import englishTranslations from './locales/en'
import { firebaseConfig } from './config'
import { registerScreens } from './scenes'
import { iconsLoaded } from './images/Icons'

const DEFAULT_LOCALE = I18n.locale.split('-')[0]
const handleMissing = (scope) => `${scope || 'unknown'}`

// $FlowFixMe: this is just development option
console.disableYellowBox = true

// Register scenes
registerScreens()

class App {
  authData: Object;
  firebaseInitialized: boolean;
  constructor () {
    console.log('app constructor')
    this.authData = {}

    Promise.all([
      Auth.getAuthData(),
      iconsLoaded
    ])
    .then((results) => {
      [ authData, loaded ] = results
      console.log('initial auth data', authData)
      this.authData = authData
      this.startApp(authData)
    })

    Auth.listenAuthChange((authData) => {
      console.log('auth change', authData)
      if (!this.authData || (this.authData.isAuthenticated !== authData.isAuthenticated)) {
        this.startApp(authData)
      }
      this.authData = authData
    })
    this.configureI18n()
    this.initFirebase()
  }

  /**
   * Start app
   */
  startApp (authData) {
    if (!authData || !authData.isAuthenticated) {
      console.log('start app dont have user')
      this.startAppAsUnauthenticatedUser()
    } else {
      console.log('start app have user', authData)
      this.startAppAsAuthenticatedUser(authData)
    }
  }

  /**
   * Start app as authenticated user
   */
  startAppAsAuthenticatedUser (authData) {
    if (Platform.OS === 'ios') {
      console.log('start ios')
      this.startAppAsAuthenticatedUserIos(authData)
    } else {
      console.log('start android')
      this.startAppAsAuthenticatedUserAndroid(authData)
    }
  }

  /**
   * Start app as unauthenticated user
   */
  startAppAsUnauthenticatedUser () {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'SIGN_IN',
        title: 'Sign in'
      }
    })
  }

  /**
   * Start as authenticated user ios
   */
  startAppAsAuthenticatedUserIos (authData: Object) {
    Navigation.startTabBasedApp({
      tabs: [
        {
          label: 'Map',
          screen: 'HOME',
          icon: require('./images/ios_maps.png'),
          title: I18n.t('challenge_map')
        },
        {
          label: 'Challenges',
          screen: 'CHALLENGES',
          icon: require('./images/ios_turns.png'),
          title: I18n.t('challenges')
        },
        {
          label: 'Profile',
          screen: 'PROFILE',
          icon: require('./images/ios_contacts.png'),
          title: I18n.t('profile')
        },
        {
          label: 'Wallet',
          screen: 'WALLET',
          icon: require('./images/ios_top_charts.png'),
          title: I18n.t('wallet')
        }
      ],
      tabsStyle: {},
      appStyle: { orientation: 'portrait' },
      passProps: { authData },
      animationType: 'slide-down'
    })
  }

  /**
   * Start as authenticated user android
   */
  startAppAsAuthenticatedUserAndroid (authData: Object) {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'HOME',
        title: I18n.t('challenge_map')
      },
      drawer: {
        left: {
          screen: 'DRAWER'
        }
      },
      passProps: { authData }
    })
  }

  /**
   * Set i18n locale
   */
  setLocale (locale: string) {
    // console.log(locale)
    I18n.locale = locale
  }

  /**
   * Configure i18n
   */
  configureI18n () {
    I18n.fallbacks = true
    I18n.default_locale = DEFAULT_LOCALE
    I18n.available_locales = ['cs', 'en']
    I18n.translations = {
      cs: czechTranslations,
      en: englishTranslations
    }
    I18n.missingTranslation = handleMissing
    I18n.missingPlaceholder = handleMissing
  }

  /**
   * Init firebase
   */
  initFirebase () {
    console.log('init firebase')
    if (this.firebaseInitialized) {
      return
    }
    this.firebaseInitialized = true
    firebase.initializeApp(firebaseConfig)
  }
}

export default App
