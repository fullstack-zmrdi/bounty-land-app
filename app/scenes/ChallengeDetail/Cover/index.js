/* @flow */
import { H1, H2 } from 'native-base'
import { Image, StyleSheet, View } from 'react-native'

import I18n from 'react-native-i18n'
import LinearGradient from 'react-native-linear-gradient'
import Logo from '../../../components/Logo'
import React from 'react'
import colors from 'material-colors'

const Cover = () => {
  return (
    <View style={styles.coverContainer}>
      {Cover.props.photo
      ? (
        <Image
          source={{ uri: Cover.props.photo }}
          style={styles.coverImage} />
      ) : (
        <Logo size={150} style={{ alignSelf: 'center', marginTop: 65 }} />
      )}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', '#fff']}
        style={styles.titleContainer}>
        <View>
          <H1
            style={StyleSheet.flatten(styles.title)}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {Cover.props.name}
          </H1>
          <H2 style={StyleSheet.flatten(styles.subtitle)}>
            {I18n.t(Cover.props.category)}
          </H2>
        </View>
      </LinearGradient>
    </View>
  )
}

Cover.props = {}

Cover.setProps = (props: Object = {}): void => {
  Cover.props = props
}

const styles = StyleSheet.create({
  coverContainer: {
    backgroundColor: colors.cyan['300'],
    height: 360
  },
  coverImage: {
    flex: 1,
    resizeMode: 'cover'
  },
  titleContainer: {
    height: 120,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  title: {
    color: colors.black,
    fontSize: 60,
    fontWeight: 'bold',
    lineHeight: 60,
    overflow: 'hidden',
    paddingHorizontal: 16
  },
  subtitle: {
    color: colors.darkText.secondary,
    left: 20
  }
})

export default Cover
