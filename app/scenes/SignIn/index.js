import { Container, Text } from 'native-base'
import { Image, View, StyleSheet } from 'react-native'
import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Zocial'
import colors from 'material-colors'
import I18n from 'react-native-i18n'

import Auth, { LOGIN_TYPES } from '../../auth'
import backgroundImage from '../../images/bounty_bg.png'
import logoImage from '../../images/logo.png'

class SignIn extends Component<void, void, void> {
  static navigatorStyle = {
    navBarHidden: true // make the nav bar hidden
  }

  // Sign in with facebook
  signInFacebook (): void {
    Auth.signInFacebook()
  }

  // Sign in with google
  signInGoogle (): void {
    Auth.signInGoogle()
  }

  // Render logo
  renderLogo (): View {
    return (
      <View style={styles.logoContainer}>
        <Image
          style={styles.logoImage}
          source={logoImage} />
      </View>
    )
  }

  // Render sign in buttons
  renderButtons (): View {
    return ([
      <View key={0}style={{ marginBottom: 10 }}>
        <Icon.Button
          style={styles.signInButton}
          name={LOGIN_TYPES.facebook}
          color={colors.white}
          backgroundColor='#3b5998'
          onPress={() => this.signInFacebook()}>
          <Text style={{ color: colors.white }}>
            {I18n.t('sign_in_facebook')}
          </Text>
        </Icon.Button>
      </View>,
      <View key={1}>
        <Icon.Button
          name={LOGIN_TYPES.google}
          style={styles.signInButton}
          color={colors.white}
          backgroundColor='#ff0000'
          onPress={() => this.signInGoogle()}>
          <Text style={{ color: colors.white }}>
            {I18n.t('sign_in_google')}
          </Text>
        </Icon.Button>
      </View>
    ])
  }

  render (): Container {
    return (
      <Container>
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}>
          <View>
            {this.renderLogo()}
            {this.renderButtons()}
          </View>
        </Image>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
    width: null,
    height: null
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 25
  },
  logoImage: {
    resizeMode: 'contain',
    width: null,
    height: null,
    flex: 1
  },
  signInButton: {
    width: 270,
    justifyContent: 'center'
  }
})

export default SignIn
