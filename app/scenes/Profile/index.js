/* @flow */
import colors from 'material-colors'
import { Button, Container, Content, H2, H3, Spinner, Text } from 'native-base'
import { Image, StyleSheet } from 'react-native'
import React, {Component} from 'react'
import I18n from 'react-native-i18n'

import Auth from '../../auth'
import { navigatorStyle } from '../../theme'
import type { Profile, AuthData } from '../../typedef'

type ProfileState = {
  profile: ?Profile,
  profileLoaded: boolean
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  signOutButton: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: colors.cyan['500']
  },
  profilePhoto: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    borderRadius: 40
  },
  email: {
    textAlign: 'center',
    paddingVertical: 8
  },
  name: {
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: 'bold'
  }
})

class ProfileScreen extends Component<void, void, ProfileState> {
  static navigatorStyle = navigatorStyle

  state = {
    profileLoaded: false,
    profile: null
  }

  componentDidMount (): void {
    Auth.getProfile()
    .then((profile: ?Profile): void => {
      this.setState({ profileLoaded: true, profile })
    })

    if (__DEV__) {
      Auth.getAuthData()
      .then((authData: ?AuthData): void => {
        this.setState({ authData })
      })
    }
  }

  signOut (): void {
    Auth.signOut()
  }

  render (): Container {
    return (
      <Container style={StyleSheet.flatten(styles.container)}>
        {this.state.profileLoaded && this.state.profile
        ? (
          <Content contentContainerStyle={{ alignItems: 'center' }}>
            <Image
              source={{ uri: this.state.profile.photo }}
              style={StyleSheet.flatten(styles.profilePhoto)} />
            <H2 style={StyleSheet.flatten(styles.name)}>
              {this.state.profile.name}
            </H2>
            <H3 style={StyleSheet.flatten(styles.email)}>
              {this.state.profile.email}
            </H3>
            <Button
              style={StyleSheet.flatten(styles.signOutButton)}
              onPress={() => this.signOut()}>
              <Text>{I18n.t('sign_out')}</Text>
            </Button>
            {__DEV__ && this.state.authData
            ? (
              <Text>
                {JSON.stringify(this.state.authData, null, 4)}
              </Text>
            ) : null}
          </Content>
        ) : (
          <Spinner />
        )}
      </Container>
    )
  }
}



export default ProfileScreen
