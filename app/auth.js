/* @flow */
import * as firebase from 'firebase'

import { AccessToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk'
import { AsyncStorage, DeviceEventEmitter, Platform } from 'react-native' //eslint-disable-line
import type { AuthData, Profile, User } from './typedef'

import type FBAccessToken from 'react-native-fbsdk/js/FBAccessToken.js'
import { GoogleSignin } from 'react-native-google-signin'
import { googleSignIn } from './config'

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
      .then((auth: string) => {
        const authData: AuthData = JSON.parse(auth)
        return authData
      })
    } else {
      return Promise.resolve(this._data)
    }
  }

  // Get profile photo url from auth data
  getProfilePhotoUrl (authData: AuthData): string {
    if (authData && authData.user) {
      return authData.type === 'facebook'
      ? (authData.user.picture ? authData.user.picture.data.url : '')
      : (authData.user.photo ? authData.user.photo : '')
    } else {
      return ''
    }
  }

  // Get profile data
  getProfile (): Promise<?Profile> {
    return this.getAuthData()
    .then((authData: AuthData) => {
      if (authData && authData.user) {
        return {
          name: authData.user.name,
          email: authData.user.email,
          id: authData.user.id,
          photo: this.getProfilePhotoUrl(authData)
        }
      } else {
        return null
      }
    })
  }

  // Save user info to firebase if not already stored
  saveUser (authData: AuthData): Promise<any> {
    if (!authData || !authData.user) {
      return Promise.resolve(false)
    } else if (authData.user && (authData.type === LOGIN_TYPES.facebook || authData.type === LOGIN_TYPES.google)) {
      const userId = authData.user.id
      const ref = firebase.database().ref(`users/${userId}`)
      return new Promise((resolve, reject) => {
        ref.once('value', (snapshot) => {
          if (snapshot.exists()) {
            return ref.update({ lastLogin: Date.now() })
            .then(resolve)
          }
          return ref.set({ type: authData.type, user: authData.user, lastLogin: Date.now() })
          .then(resolve)
        })
      })
    }
    return Promise.resolve(false)
  }

  // Save auth data
  setAuthData (authData: AuthData): void {
    this._data = authData
    const payload = JSON.stringify(authData)
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
  getFacebookUserProfile (): Promise<User> {
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
  signInFacebook (): Promise<any> {
    // FBLoginManager.setLoginBehavior(FBLoginManager.LoginBehaviors.Native) // defaults to Native
    const authData: AuthData = {
      isAuthenticated: true,
      type: LOGIN_TYPES.facebook,
      loginResult: {}
    }
    return LoginManager.logInWithReadPermissions(FB_LOGIN_PERMS)
    .then((result: Object) => {
      if (result.isCancelled) {
        // console.log('facebook sign in cancelled', result)
        throw new Error('User cancelled login')
      } else {
        // console.log('facebook sign in', result)
        authData.loginResult = result
        return AccessToken.getCurrentAccessToken()
      }
    })
    .then((token: ?FBAccessToken) => {
      if (token) {
        authData.token = token
      }
      return this.getFacebookUserProfile()
    })
    .then((user: User) => {
      authData.user = user
      this.setAuthData(authData)
      return authData
    })
    .then((authData: AuthData) => {
      return this.saveUser(authData)
    })
    .catch((err: Error) => {
      console.log('facebook sign in err', err)
      return null
    })
  }

  signInGoogle (): Promise<any> {
    return GoogleSignin.configure({
      iosClientId: Platform.OS === 'ios' ? googleSignIn.iosClientId : googleSignIn.webClientId // only for iOS
    })
    .then(() => {
      return GoogleSignin.signIn()
    })
    .then((user: Object) => {
      // console.log('google sign in', user)
      const authData = { isAuthenticated: true, type: LOGIN_TYPES.google, user }
      this.setAuthData(authData)
      return authData
    })
    .then((authData: AuthData) => {
      return this.saveUser(authData)
    })
    .catch((err: Error) => {
      console.log('google sign in err', err)
      return null
    })
  }

  // sign out
  signOut () {
    this.getAuthData()
    .then((authData: AuthData) => {
      if (!authData) {
        const _authData = { isAuthenticated: false, type: LOGIN_TYPES.unknown }
        this.setAuthData(_authData)
      }

      if (authData.type === LOGIN_TYPES.facebook) {
        this.signOutFacebook()
      } else {
        this.signOutGoogle()
      }
    })
    .catch((err: Error) => {
      console.log('sign out err', err)
    })
  }

  signOutFacebook (): void {
    LoginManager.logOut()
    const authData = { isAuthenticated: false, type: LOGIN_TYPES.facebook }
    this.setAuthData(authData)
  }

  signOutGoogle (): void {
    GoogleSignin.signOut()
    .then(() => {
      const authData = { isAuthenticated: false, type: LOGIN_TYPES.google }
      this.setAuthData(authData)
    })
    .catch((err: Error) => {
      console.log('google sign out err', err)
    })
  }
}

export default new Auth()
