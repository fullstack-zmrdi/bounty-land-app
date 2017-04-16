/* @flow */
import { AccessToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk'
import { AsyncStorage, DeviceEventEmitter, Platform } from 'react-native' //eslint-disable-line
import { GoogleSignin } from 'react-native-google-signin'

import { googleSignIn } from './config'
import type { Profile, AuthData } from './typedef'

export const AUTH_CHANGE_EVENT = 'authChange'

export const LOGIN_TYPES = {
  facebook: 'facebook',
  google: 'google',
  unknown: 'unknown'
}

const AUTH_STORAGE_KEY = 'auth'
const FB_PROFILE_FIELDS = 'email,name,friends,picture'
const FB_LOGIN_PERMS = ['email', 'user_friends', 'public_profile']

class Auth {
  _data: AuthData;
  emitter: DeviceEventEmitter;
  constructor () {
    this.emitter = DeviceEventEmitter
  }

  // utils
  // Listen for auth change
  listenAuthChange (callback: Function): void {
    this.emitter.addListener(AUTH_CHANGE_EVENT, (data) => callback(data))
  }

  // Dispatch auth change
  dispatchAuthChange (authData: AuthData): void {
    this.emitter.emit(AUTH_CHANGE_EVENT, authData)
  }

  // Get auth data
  getAuthData (): Promise<AuthData> {
    if (!this._data) {
      return AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((auth) => {
        const authData = JSON.parse(auth)
        return authData
      })
    } else {
      return Promise.resolve(this._data)
    }
  }

  // Get profile photo url from auth data
  getProfilePhotoUrl (authData: AuthData): string {
    if (authData.user) {
      return authData.type === 'facebook' ? authData.user.picture.data.url : authData.user.photo
    } else {
      return ''
    }
  }

  // Get profile data
  getProfile (): Promise<Profile> {
    return this.getAuthData()
    .then((authData: AuthData) => {
      if (authData && authData.user) {
        return {
          photo: this.getProfilePhotoUrl(authData),
          name: authData.user.name,
          email: authData.user.email
        }
      } else {
        return null
      }
    })
  }

  // Save auth data
  setAuthData (authData: AuthData): void {
    const payload = JSON.stringify(authData)
    this._data = authData
    return AsyncStorage.setItem(AUTH_STORAGE_KEY, payload)
    .then(() => {
      this.dispatchAuthChange(authData)
    })
  }

  // Sign in with facebook or google
  signIn (loginType: 'facebook'|'google'): void {
    if (loginType === LOGIN_TYPES.facebook) {
      this.signInFacebook()
    } else {
      this.signInGoogle()
    }
  }

  // Get facebook user profile
  getFacebookUserProfile (): Promise<Object> {
    return new Promise((resolve: Function, reject: Function) => {
      const req = new GraphRequest('/me', {
        parameters: {
          fields: {
            string: FB_PROFILE_FIELDS
          }
        }
      }, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
      new GraphRequestManager().addRequest(req).start()
    })
  }

  // Sign in with facebook
  signInFacebook () {
    // FBLoginManager.setLoginBehavior(FBLoginManager.LoginBehaviors.Native) // defaults to Native
    const authData = {
      isAuthenticated: true,
      type: LOGIN_TYPES.facebook,
      user: {},
      loginResult: {},
      token: {}
    }
    LoginManager.logInWithReadPermissions(FB_LOGIN_PERMS)
    .then((result: Object) => {
      if (result.isCancelled) {
        console.log('facebook sign in cancelled', result)
        throw new Error('User cancelled login')
      } else {
        console.log('facebook sign in', result)
        authData.loginResult = result
        return AccessToken.getCurrentAccessToken()
      }
    })
    .then((token: Object) => {
      authData.token = token
      return this.getFacebookUserProfile()
    })
    .then((user: Object) => {
      authData.user = user
      this.setAuthData(authData)
    })
    .catch((err) => {
      console.log('facebook sign in err', err)
    })
  }

  signInGoogle () {
    GoogleSignin.configure({
      iosClientId: Platform.OS === 'ios' ? googleSignIn.iosClientId : googleSignIn.webClientId // only for iOS
    })
    .then(() => {
      return GoogleSignin.signIn()
    })
    .then((user) => {
      console.log('google sign in', user)
      const authData = { isAuthenticated: true, type: LOGIN_TYPES.google, user }
      this.setAuthData(authData)
    })
    .catch((err) => {
      console.log('google sign in err', err)
    })
  }

  // sign out
  signOut () {
    this.getAuthData()
    .then((authData: AuthData) => {
      if (!authData) {
        const _authData = { isAuthenticated: false, type: LOGIN_TYPES.unknown, user: null }
        this.setAuthData(_authData)
      }

      console.log('auth data', authData)

      if (authData.type === LOGIN_TYPES.facebook) {
        this.signOutFacebook()
      } else {
        this.signOutGoogle()
      }
    })
    .catch((err) => {
      console.log('sign out err', err)
    })
  }

  signOutFacebook () {
    LoginManager.logOut()
    const authData = { isAuthenticated: false, type: LOGIN_TYPES.facebook, user: null }
    this.setAuthData(authData)
  }

  signOutGoogle () {
    GoogleSignin.signOut()
    .then(() => {
      console.log('google sign out succ')
      const authData = { isAuthenticated: false, type: LOGIN_TYPES.google, user: null }
      this.setAuthData(authData)
    })
    .catch((err) => {
      console.log('google sign out err', err)
    })
  }
}

export default new Auth()
