/* @flow */
export type Profile = {
  photo: string,
  name: string,
  email: string
}

export type AuthData = {
  isAuthenticated: boolean,
  type: 'facebook'|'google'|'unknown',
  user: ?Object,
  loginResult?: Object,
  token?: Object
}
