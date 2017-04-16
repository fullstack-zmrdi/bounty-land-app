/* @flow */
export type Profile = {
  photo: string,
  name: string,
  email: string,
  id: string
}

export type AuthData = {
  isAuthenticated: boolean,
  type: 'facebook'|'google'|'unknown',
  user: ?Object,
  loginResult?: Object,
  token?: Object
}

export type Challenge = {
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
