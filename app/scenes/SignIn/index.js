import Auth, { LOGIN_TYPES } from '../../auth'
import { Container, Text } from 'native-base'
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import Colors from 'material-colors'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Zocial'
import LinearGradient from 'react-native-linear-gradient'
import Logo from '../../components/Logo'

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

  // Render sign in buttons
  renderButtons (): View {
    return ([
      <View key={0}style={{ marginBottom: 10 }}>
        <Icon.Button
          style={styles.signInButton}
          name={LOGIN_TYPES.facebook}
          color={Colors.white}
          backgroundColor='#3b5998'
          onPress={() => this.signInFacebook()}>
          <Text style={{ color: Colors.white }}>
            {I18n.t('sign_in_facebook')}
          </Text>
        </Icon.Button>
      </View>,
      <View key={1}>
        <Icon.Button
          name={LOGIN_TYPES.google}
          style={styles.signInButton}
          color={Colors.white}
          backgroundColor='#ff0000'
          onPress={() => this.signInGoogle()}>
          <Text style={{ color: Colors.white }}>
            {I18n.t('sign_in_google')}
          </Text>
        </Icon.Button>
      </View>
    ])
  }

  render (): Container {
    return (
      <Container>
        <LinearGradient
          style={styles.background}
          colors={[Colors.cyan['500'], '#b09b2c']}>
          <View>
            <Logo style={styles.logo} />
            {this.renderButtons()}
          </View>
        </LinearGradient>
      </Container>
    )
  }
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
