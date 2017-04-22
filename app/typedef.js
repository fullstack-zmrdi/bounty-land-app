/* @flow */
import type FBAccessToken from 'react-native-fbsdk/js/FBAccessToken.js'

export type Profile = {
  photo: string,
  name: string,
  email: string,
  id: string
}

export type User = {
  name: string,
  email: string,
  id: string,
  picture?: Object,
  photo?: string
}

export type AuthData = {
  isAuthenticated: boolean,
  type: 'facebook'|'google'|'unknown',
  user?: User,
  loginResult?: Object,
  token?: FBAccessToken
}

export type Challenge = {
  id: string,
  category: string,
  createdBy: string,
  name: string,
  location: {
    radiusInMeters: number,
    latitude: number,
    longitude: number
  },
  photo: string,
  description: string,
  bounty: number,
  endDate: string,
  supporters: Array<string>,
  participants: Array<string>
}
