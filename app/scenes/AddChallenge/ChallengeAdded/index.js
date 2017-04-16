/* @flow */
import { Body, Card, CardItem, H1, Row, Text } from 'native-base'
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, {Component} from 'react'
import Icon from 'react-native-vector-icons/Zocial'
import IosIcon from 'react-native-vector-icons/Ionicons'
import I18n from 'react-native-i18n'
import colors from 'material-colors'

type PropsType = {
  navigator: Object
}

class ChallengeAddedModal extends Component<void, PropsType, void> {
  static navigatorStyle = {
    navBarHidden: true
  }

  // Go back to home
  finish () {
    if (Platform.OS === 'ios') {
      this.props.navigator.dismissLightBox()
    }
    this.props.navigator.dismissAllModals()
  }

  // TODO: Share challenge on facebook
  share () {

  }

  renderHeader (): CardItem {
    return (
      <CardItem header>
        <H1>{I18n.t('awesome')}!!</H1>
      </CardItem>
    )
  }

  renderContent (): CardItem {
    return (
      <CardItem body>
        <Body>
          <View>
            <Text style={{ lineHeight: 24 }}>
              {I18n.t('challenge_added_summary', { points: 50 })}
            </Text>
          </View>
          <Row style={StyleSheet.flatten([styles.row, { marginTop: 15 }])}>
            <IosIcon
              name='ios-heart'
              color={colors.cyan['500']}
              size={50} />
            <Text style={StyleSheet.flatten(styles.karmaText)}>
              +50 KARMA
            </Text>
          </Row>
        </Body>
      </CardItem>
    )
  }

  renderFooter (): CardItem {
    return (
      <CardItem footer>
        <Row style={StyleSheet.flatten(styles.row)}>
          <Icon.Button
            style={{ justifyContent: 'center' }}
            name='facebook'
            color={colors.white}
            backgroundColor='#3b5998'
            onPress={() => this.signInFacebook()}>
            <Text style={{ color: colors.white }}>
              {I18n.t('share_on_facebook')}
            </Text>
          </Icon.Button>
          <TouchableOpacity
            onPress={this.finish.bind(this)}>
            <IosIcon
              color={colors.cyan['500']}
              name='ios-checkmark-circle-outline'
              size={50} />
          </TouchableOpacity>
        </Row>
      </CardItem>
    )
  }

  render (): Card {
    return (
      <Card style={{ width: 280 }}>
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 240
  },
  karmaText: {
    height: 32,
    lineHeight: 32,
    color: colors.cyan['500'],
    fontSize: 32
  }
})

export default ChallengeAddedModal
