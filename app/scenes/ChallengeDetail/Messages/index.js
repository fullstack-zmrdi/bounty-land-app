import * as firebase from 'firebase'
import { Row, Text } from 'native-base'
import { StyleSheet, View, ScrollView, Image, LayoutAnimation, TextInput, Keyboard, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import { navigatorStyle } from '../../../theme'
import { iconsMap } from '../../../images/Icons'
import Auth from '../../../auth'
import colors from 'material-colors'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Ionicons'
import ObjectId from 'bson-objectid'
import map from 'lodash/map'

class ChallengeMessages extends Component {
  static navigatorStyle = navigatorStyle
  state = {
    message: '',
    messages: {},
    members: {}
  }

  componentDidMount () {
    console.log('did mount')
    Auth.getProfile()
    .then((profile) => {
      this.setState({ profile })
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
      this.props.navigator.setButtons({
        leftButtons: [{
          id: 'back',
          color: colors.white,
          icon: iconsMap['ios-arrow-back']
        }]
      })
    })
    this.loadMessages()
  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
  }

  componentWillUnmount () {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  componentWillUpdate () {
    LayoutAnimation.easeInEaseOut()
  }

  keyboardWillShow = (event) => {
    this.setState({ keyboardHeight: event.endCoordinates.height })
    this.scrollView.scrollToEnd({ animated: true })
  }

  keyboardWillHide = (event) => {
    this.setState({ keyboardHeight: 0 })
  }

  onNavigatorEvent (event) {
    if (event.id === 'back') {
      this.onBackPress()
    }
  }

  // Return to previous screen
  onBackPress (): void {
    this.props.navigator.dismissModal()
  }

  onMessageChange (val: string) {
    this.setState({ message: val })
  }

  onSendMessagePress () {
    this.sendMessage(this.state.message)
    .then(() => {
      this.setState({ message: '' })
    })
  }

  sendMessage (message: string) {
    if (!message) {
      return
    }
    const messageId = ObjectId().toString()
    const ref = firebase.database().ref(`messages/${this.props.challenge.id}/${messageId}`)
    return ref.set({
      id: messageId,
      text: message,
      createdBy: this.state.profile.id,
      createdAt: Date.now()
    })
  }

  loadMember (userId) {
      // Load challenger info
    const ref = firebase.database().ref(`users/${userId}`)
    return ref.once('value', (snapshot) => {
      this.setState({ members: {
        ...this.state.members,
        [userId]: snapshot.val()
      }})
    })
  }

  loadMessages () {
    firebase.database()
    .ref(`messages/${this.props.challenge.id}`)
    .limitToLast(30)
    .on('value', (snapshot) => {
      if (snapshot.val()) {
        // console.log(snapshot.val())
        this.setState({ messages: snapshot.val() })
      }
    })
  }

  scrollToEnd () {
    this.scrollView.scrollToEnd({animated: true})
  }

  renderMessageForm () {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder={I18n.t('enter_message')}
          style={styles.textInput}
          value={this.state.message}
          onChangeText={this.onMessageChange.bind(this)} />
        <TouchableOpacity
          onPress={this.onSendMessagePress.bind(this)}
          style={styles.submitButton}
          hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}>
          <Icon
            name='ios-send'
            size={40}
            color={colors.cyan['500']}
            style={{ backgroundColor: 'transparent' }} />
        </TouchableOpacity>
      </View>
    )
  }

  renderMessages () {
    if (!this.state.profile) {
      return null
    }
    let prevUserId
    return (
      <ScrollView
        ref={(ref) => { this.scrollView = ref }}
        onContentSizeChange={this.scrollToEnd.bind(this)}
        onLayout={this.scrollToEnd.bind(this)}
        contentContainerStyle={{ paddingVertical: 8 }}>
        {map(this.state.messages, (msg) => {
          const isMyMessage = this.state.profile.id === msg.createdBy
          let showPhoto = true
          if (prevUserId === msg.createdBy) {
            showPhoto = false
          }
          prevUserId = msg.createdBy
          if (!isMyMessage && !this.state.members[msg.createdBy]) {
            this.loadMember(msg.createdBy)
          }
          return (
            <Row key={msg.id} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              {isMyMessage ? (<Text />) : null}
              <View
                style={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start', flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
                {!isMyMessage && showPhoto
                ? (
                  <Image
                    source={{ uri: Auth.getProfilePhotoUrl(this.state.members[msg.createdBy]) }}
                    style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <View style={{ width: 40 }} />
                )}
                <View
                  style={[{ backgroundColor: isMyMessage ? colors.cyan['500'] : colors.grey['200'], padding: 8, marginTop: showPhoto ? 2 : 0, borderRadius: 4 }]}>
                  <Text style={{ color: isMyMessage ? colors.white : colors.black }}>
                    {msg.text}
                  </Text>
                </View>
              </View>
              {!isMyMessage ? (<Text />) : null}
            </Row>
          )
        })}
      </ScrollView>
    )
  }

  render () {
    return (
      <View style={[ styles.container, { paddingBottom: this.state.keyboardHeight } ]}>
        {this.renderMessages()}
        {this.renderMessageForm()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    flex: 1
  },
  textInput: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    margin: 4,
    borderColor: colors.grey['300'],
    height: 44,
    paddingHorizontal: 10,
    paddingRight: 50,
    backgroundColor: colors.grey['200']
  },
  submitButton: {
    position: 'absolute',
    right: 16,
    bottom: 2
  }
})

export default ChallengeMessages
