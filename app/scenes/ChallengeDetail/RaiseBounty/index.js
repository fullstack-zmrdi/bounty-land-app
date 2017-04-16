/* @flow */
import { Body, Card, CardItem, H1, Row, Text, Button, Item, Input, Label, Form } from 'native-base'
import { Platform } from 'react-native'
import React, {Component} from 'react'
import I18n from 'react-native-i18n'

type PropsType = {
  navigator: Object
}

type StateType = {
  amount: string
}

class RaiseBountyModal extends Component<void, PropsType, StateType> {
  static navigatorStyle = {
    navBarHidden: true
  }

  state = {
    amount: '0'
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

  submitRaiseBounty () {
    this.props.navigator.dismissLightBox()
  }

  renderHeader (): CardItem {
    return (
      <CardItem header>
        <H1>{I18n.t('raise_bounty')}!!</H1>
      </CardItem>
    )
  }

  renderContent (): CardItem {
    return (
      <CardItem body>
        <Body>
          <Form>
            <Item floatingLabel style={{ width: 240 }}>
              <Label>{I18n.t('enter_amount')}</Label>
              <Input
                autoFocus
                value={this.state.amount}
                onChangeText={(val) => this.setState({ amount: val })} />
            </Item>
          </Form>
        </Body>
      </CardItem>
    )
  }

  renderFooter (): CardItem {
    return (
      <CardItem footer>
        <Row>
          <Button transparent onPress={() => this.props.navigator.dismissLightBox()}>
            <Text>{I18n.t('cancel')}</Text>
          </Button>
          <Button transparent onPress={this.submitRaiseBounty.bind(this)}>
            <Text>{I18n.t('ok')}</Text>
          </Button>

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

export default RaiseBountyModal
