/* @flow */
import { Body, Button, Card, CardItem, Container, Content, Form, H2, Input, Item, Label, Row, Text, Segment } from 'native-base';
import { Platform, View } from 'react-native'
import React, {Component} from 'react'
import map from 'lodash/map'
import I18n from 'react-native-i18n'

import { CHALLENGE_CATEGORIES } from '../../../const'

type PropsType = {
  navigator: Object,
  photoPath: ?string
}

type StateType = {
  name: string,
  bounty: string,
  category: string,
  description: string,
  endDate: string
}

class AddChallenge extends Component<void, PropsType, StateType> {
  static navigatorStyle = {
    navBarHidden: true
  }

  state = {
    name: '',
    bounty: '',
    category: 'fun',
    description: '',
    endDate: ''
  }

  // Hide modal show previous screen
  onCancelPress (): void {
    if (Platform.OS === 'ios') {
      this.props.navigator.dismissLightBox()
    } else {
      this.props.navigator.dismissModal()
    }
  }

  // When user is done with details continue to next screen
  onSelectLocationPress (): void {
    this.props.navigator.showModal({
      screen: 'SELECT_LOCATION',
      passProps: {
        challengeData: { photo: this.props.photoPath, ...this.state }
      }
    })
  }

  // Render modal header
  renderHeader (): View {
    return (
      <View>
        <CardItem header>
          <H2>{I18n.t('add_challenge')}</H2>
        </CardItem>
        <Segment style={{ borderBottomWidth: 0 }}>
          {map(CHALLENGE_CATEGORIES, (category, i) => {
            return (
              <Button
                key={i}
                first={i === CHALLENGE_CATEGORIES.garbage}
                last={i === CHALLENGE_CATEGORIES.deeds}
                active={this.state.category === category}
                onPress={() => this.setState({ category })}>
                <Text>{I18n.t(category)}</Text>
              </Button>
            )
          })}
        </Segment>
      </View>
    )
  }

  // Render modal content with form
  renderContent (): Content {
    return (
      <Content>
        <CardItem body>
          <Body>
            <Form style={{ width: 240 }}>
              <Item floatingLabel style={{ marginBottom: 20, marginLeft: 0 }} >
                <Label>{I18n.t('name')}</Label>
                <Input
                  autoFocus
                  value={this.state.name}
                  onChangeText={(val) => this.setState({ name: val })} />
              </Item>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Item floatingLabel style={{ flex: 0.5, marginLeft: 0 }}>
                  <Label>{I18n.t('bounty')}</Label>
                  <Input
                    keyboardType='numeric'
                    value={this.state.bounty}
                    onChangeText={(val) => this.setState({ bounty: val })} />
                </Item>
                <Item floatingLabel style={{ flex: 0.5, marginLeft: 15 }}>
                  <Label>{I18n.t('end_date')}</Label>
                  <Input
                    value={this.state.endDate}
                    onChangeText={(val) => this.setState({ endDate: val })} />
                </Item>
              </View>
              <Item
                floatingLabel
                style={{ marginLeft: 0 }}>
                <Label>{I18n.t('description')}</Label>
                <Input
                  multiline
                  numberOfLines={3}
                  value={this.state.description}
                  onChangeText={(val) => this.setState({ description: val })} />
              </Item>
            </Form>
          </Body>
        </CardItem>
      </Content>
    )
  }

  // Reder modal footer
  renderFooter (): CardItem {
    return (
      <CardItem footer>
        <Row>
          <Button
            transparent
            onPress={() => this.onCancelPress()}>
            <Text>{I18n.t('cancel').toUpperCase()}</Text>
          </Button>
          <Button
            transparent
            onPress={() => this.onSelectLocationPress()}>
            <Text>{I18n.t('select_location').toUpperCase()}</Text>
          </Button>
        </Row>
      </CardItem>
    )
  }

  render (): Container {
    return (
      <Container style={{ marginHorizontal: 16, paddingVertical: 40 }}>
        <Card>
          {this.renderHeader()}
          {this.renderContent()}
          {this.renderFooter()}
        </Card>
      </Container>
    )
  }
}

export default AddChallenge
