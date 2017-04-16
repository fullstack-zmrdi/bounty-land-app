import React, {Component} from 'react'

import { View } from 'react-native'
import * as firebase from "firebase"

import { Container, Content, Card, CardItem, Text, Body, H2, Button,  Row, Form, Item, Label, Input } from 'native-base';
import I18n from 'react-native-i18n'
import { navigatorStyle } from '../../theme'
import { iconsMap } from '../../images/Icons'
class ChallengeDetail extends Component {
  static navigatorStyle = navigatorStyle

  state = {
    name: '',
    bounty: ''
  }

  componentDidMount () {
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.props.navigator.setButtons({
      leftButtons: [{
        id: 'back',
        icon: iconsMap['ios-arrow-back']
      }]
    })
  }

  onNavigatorEvent (event) {
    if (event.id === 'back') {
      this.onBackPress()
    }
  }


  onParticipatePress () {

  }

  onReportPress () {

  }

  onRaiseBountyPress () {

  }

  onBackPress () {
    this.props.navigator.dismissModal()
  }

  renderFooter () {
    return (
      <Row>
        <Button transparent onPress={this.onBackPress.bind(this)}>
          <Text>{I18n.t('cancel').toUpperCase()}</Text>
        </Button>
        <Button transparent onPress={this.onRaiseBountyPress.bind(this)}>
          <Text>{I18n.t('raise_bounty').toUpperCase()}</Text>
        </Button>
        <Button transparent onPress={this.onParticipatePress.bind(this)}>
          <Text>{I18n.t('participate').toUpperCase()}</Text>
        </Button>
      </Row>
    )
  }

  render () {
    return (
      <Container style={{ padding: 16 }}>
        <Content>



          {this.renderFooter()}
        </Content>
      </Container>
    )
  }
}

export default ChallengeDetail
