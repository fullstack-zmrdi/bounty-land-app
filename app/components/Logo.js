/* @flow */
import { Image } from 'react-native'
import LogoImage from '../images/logo.png'
import React from 'react'

const Logo = ({
  size = 200,
  style
} : {
  size: number,
  style?: Object
}) => {
  return (
    <Image
      source={LogoImage}
      style={[
        style,
        {
          width: size,
          height: size,
          resizeMode: 'contain'
        }]} />
  )
}

export default Logo
