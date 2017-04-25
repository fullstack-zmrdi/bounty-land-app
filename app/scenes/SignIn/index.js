import Auth, { LOGIN_TYPES } from '../../auth'
import { Container, Text } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Colors from 'material-colors'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Zocial'
import LinearGradient from 'react-native-linear-gradient'
import Logo from '../../components/Logo'
import { themeColors } from '../../theme'

const SignIn = (): Container => {
  return (
    <Container>
      <LinearGradient
        style={styles.background}
        colors={[themeColors.primaryColor, themeColors.accentColor]}>
        <Logo style={styles.logo} />
        <View style={{ marginBottom: 10 }}>
          <Icon.Button
            style={styles.signInButton}
            name={LOGIN_TYPES.facebook}
            color={Colors.white}
            backgroundColor='#3b5998'
            onPress={Auth.signInFacebook}>
            <Text style={{ color: Colors.white }}>
              {I18n.t('sign_in_facebook')}
            </Text>
          </Icon.Button>
        </View>
        <View>
          <Icon.Button
            name={LOGIN_TYPES.google}
            style={styles.signInButton}
            color={Colors.white}
            backgroundColor='#ff0000'
            onPress={Auth.signInGoogle}>
            <Text style={{ color: Colors.white }}>
              {I18n.t('sign_in_google')}
            </Text>
          </Icon.Button>
        </View>
      </LinearGradient>
    </Container>
  )
}

SignIn.navigatorStyle = {
  navBarHidden: true // make the nav bar hidden
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 30
  },
  signInButton: {
    width: 270,
    justifyContent: 'center'
  }
})

export default SignIn
