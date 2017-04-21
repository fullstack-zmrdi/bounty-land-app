/* @flow */
import * as firebase from 'firebase'

import { Image, Keyboard, LayoutAnimation, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { Component } from 'react'
import { Row, Text } from 'native-base'

import Auth from '../../../auth'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Ionicons'
import ObjectId from 'bson-objectid'
import colors from 'material-colors'
import { iconsMap } from '../../../images/Icons'
import map from 'lodash/map'
import { navigatorStyle } from '../../../theme'

import type { Profile } from '../../../typedef'

type PropsType = {
  navigator: Object,
  challenge: null
}

type StateType = {
  message: string,
  messages: Object,
  members: Object,
  profile: ?Profile,
  keyboardHeight: number
}

class ChallengeMessages extends Component<void, PropsType, StateType> {
  keyboardWillShowSub: Object;
  keyboardWillHideSub: Object;
  scrollView: ScrollView;
  static navigatorStyle = navigatorStyle
  state = {
    message: '',
    messages: {},
    members: {},
    profile: null,
    keyboardHeight: 0
  }

  /*********************/
  /* Lifecycle methods */
  /*********************/
  componentDidMount (): void {
    Auth.getProfile()
    .then((profile) => {
      this.setState({ profile })
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
      this.props.navigator.setButtons({
        leftButtons: [{
          id: 'back',
          buttonColor: colors.white,
          icon: Platform.OS === 'ios' && iconsMap['ios-arrow-back']
        }]
      })
    })
    this.loadMessages()
  }

  // Add keyboard listeners
  componentWillMount (): void {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow.bind(this))
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this))
  }

  // Remove keyboard listeners
  componentWillUnmount (): void {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  // Setup layout animation
  componentWillUpdate (): void {
    LayoutAnimation.easeInEaseOut()
  }

  // Load chat member
  loadMember (userId: string): void {
      // Load challenger info
    const ref = firebase.database().ref(`users/${userId}`)
    return ref.once('value', (snapshot) => {
      this.setState({ members: {
        ...this.state.members,
        [userId]: snapshot.val()
      }})
    })
  }

  // Load messages from firebase
  loadMessages (): void {
    if (this.props.challenge) {
      const challengeId = this.props.challenge.id
      firebase.database()
      .ref(`messages/${challengeId}`)
      .limitToLast(30)
      .on('value', (snapshot) => {
        if (snapshot.val()) {
          // console.log(snapshot.val())
          this.setState({ messages: snapshot.val() })
        }
      })
    }
  }

  /******************/
  /* Event handlers */
  /******************/
  // Handle when keyboard will show
  onKeyboardWillShow (event: Object): void {
    this.setState({ keyboardHeight: event.endCoordinates.height })
    this.scrollView.scrollToEnd({ animated: true })
  }

  // Handle when keyboard will hide
  onKeyboardWillHide (event: Object): void {
    this.setState({ keyboardHeight: 0 })
  }

  // Handle navigator event (back button only)
  onNavigatorEvent (event: Object): void {
    if (event.id === 'back') {
      this.onBackPress()
    }
  }

  // Return to previous screen
  onBackPress (): void {
    this.props.navigator.dismissModal()
  }

  // Handle message input change
  onMessageChange (val: string): void {
    this.setState({ message: val })
  }

  // Send message
  onSendMessagePress (): void {
    if (!this.state.message || !this.state.profile || !this.props.challenge) {
      return
    }
    const challengeId = this.props.challenge && this.props.challenge.id
    const messageId = ObjectId().toString()
    const ref = firebase.database().ref(`messages/${challengeId}/${messageId}`)
    ref.set({
      id: messageId,
      text: this.state.message,
      createdBy: this.state.profile && this.state.profile.id,
      createdAt: Date.now()
    })
    .then(() => {
      this.setState({ message: '' })
    })
  }

  // Scoll to end of messages
  scrollToEnd (): void {
    this.scrollView.scrollToEnd({animated: true})
  }

  /******************/
  /* Render helpers */
  /******************/
  // Render mesasge form
  renderMessageForm (): View {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder={I18n.t('enter_message')}
          style={styles.textInput}
          underlineColorAndroid='transparent'
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

  // Render message list
  renderMessages (): ?ScrollView {
    if (!this.state.profile) {
      return null
    }
    let prevUserId
    const messageRowStyle = StyleSheet.flatten(styles.messageRow)
    return (
      <ScrollView
        ref={(ref) => { this.scrollView = ref }}
        onContentSizeChange={this.scrollToEnd.bind(this)}
        onLayout={this.scrollToEnd.bind(this)}
        contentContainerStyle={{ paddingVertical: 8 }}>
        {map(this.state.messages, (msg) => {
          const isMyMessage = this.state.profile && (this.state.profile.id === msg.createdBy)
          let showPhoto = true
          if (prevUserId === msg.createdBy) {
            showPhoto = false
          }
          prevUserId = msg.createdBy
          if (!isMyMessage && !this.state.members[msg.createdBy]) {
            this.loadMember(msg.createdBy)
          }
          return (
            <Row key={msg.id} style={messageRowStyle}>
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

  render (): View {
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
  messageRow: {
    justifyContent: 'space-between',
    alignItems: 'center'
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
