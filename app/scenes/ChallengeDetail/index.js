import * as firebase from 'firebase'

import { Button, Container, Content, H1, H2, Row, Segment, Text } from 'native-base'
import { Image, LayoutAnimation, Platform, StatusBar, StyleSheet, View } from 'react-native'
import React, {Component} from 'react'

import Auth from '../../auth'
import I18n from 'react-native-i18n'
import LinearGradient from 'react-native-linear-gradient'
import Logo from '../../components/Logo'
import colors from 'material-colors'
import { iconsMap } from '../../images/Icons'

class ChallengeDetail extends Component {
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true,
    navBarButtonColor: colors.white
  }

  state = {
    challenger: null,
    showDescription: false
  }

  componentDidMount () {
    StatusBar.setBarStyle('light-content', true)
    Auth.getProfile()
    .then((profile) => {
      const { navigator, challenge } = this.props
      const isLiked = challenge.likes && challenge.likes.find((likeId) => profile.id === likeId)
      navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
      navigator.setButtons({
        leftButtons: [{
          id: 'back',
          color: colors.white,
          icon: iconsMap['ios-arrow-back']
        }],
        rightButtons: this.getRightButtons(isLiked)
      })
      this.loadChallenger()
    })
  }

  componentWillUpdate () {
    LayoutAnimation.easeInEaseOut()
  }

  componentWillUnmount () {
    StatusBar.setBarStyle('dark-content', true)
  }

  onNavigatorEvent (event) {
    if (event.id === 'back') {
      this.onBackPress()
    }

    if (event.id === 'like') {
      this.onLikePress()
    }

    if (event.id === 'share') {
      this.onSharePress()
    }
  }

  // Get right buttons
  getRightButtons (hasLike: boolean): Array<Object> {
    return [{
      id: 'like',
      icon: hasLike ? iconsMap['ios-heart'] : iconsMap['ios-heart-outline']
    }, {
      id: 'share',
      icon: iconsMap['ios-share-outline']
    }]
  }

  // Set right buttons
  setRightButtons (hasLike: boolean): void {
    this.props.navigator.setButtons({
      rightButtons: this.getRightButtons(hasLike)
    })
  }

  // On participate press
  onParticipatePress (): void {
    return Auth.getProfile()
    .then((profile) => {
      const challengeRef = firebase.database().ref(`challenges/${this.props.challenge.id}`)
      challengeRef.once('value', (snapshot) => {
        const challenge = snapshot.val()
        this.addParticipant(profile, challenge, challengeRef)
      })
    })
  }

  // Show modal with raise bounty fields
  onRaiseBountyPress (): void {
    if (Platform.OS === 'ios') {
      this.props.navigator.showLightBox({
        screen: 'RAISE_BOUNTY',
        style: {
          backgroundBlur: 'dark'
        }
      })
    }
  }

  // Toggle like
  onLikePress (): void {
    const ref = firebase.database().ref(`challenges/${this.props.challenge.id}`)
    return ref.once('value', (snapshot) => {
      const challenge = snapshot.val()
      // console.log('got snapshot val')

      if (!challenge.likes) {
        challenge.likes = []
        challenge.likeCount = 0
      }

      return Auth.getProfile()
      .then((profile) => {
        if (!challenge.likes.find((userId) => userId === profile.id)) {
          this.addLike(profile, challenge, ref)
        } else {
          this.removeLike(profile, challenge, ref)
        }
      })
    })
  }

  // Return to previous screen
  onBackPress (): void {
    this.props.navigator.dismissModal()
  }

  onReportPress () {

  }

  onSharePress () {

  }

  onShowMapPress () {

  }

  onMessagesPress () {
    this.props.navigator.showModal({
      screen: 'CHALLENGE_MESSAGES',
      title: this.props.challenge.name,
      passProps: { challenge: this.props.challenge }
    })
  }

  // Handle scroll
  onScroll (data: Object): void {
    // console.log('on scroll', data.nativeEvent)
    if (data.nativeEvent.contentOffset.y < 300) {
      this.navBarHidden = true
      this.toggleNavBarStyles('light')
    } else if (data.nativeEvent.contentOffset.y > 300) {
      if (this.navBarHidden) {
        this.toggleNavBarStyles('dark')
      }
    }
  }

  // Toggle nav bar styles
  toggleNavBarStyles (style: 'dark'|'light'): void {
    if (style === 'light') {
      this.props.navigator.setTitle({ title: '' })
      this.props.navigator.setStyle({
        navBarButtonColor: colors.white,
        navBarTransparent: true,
        navBarTranslucent: true,
        navBarBlur: false
      })
    } else if (style === 'dark') {
      this.props.navigator.setTitle({ title: this.props.challenge.name })
      this.props.navigator.setStyle({
        navBarButtonColor: colors.black,
        navBarTransparent: false,
        navBarTranslucent: false,
        navBarBlur: true
      })
    }
  }

  // Load challenger info
  loadChallenger (): void {
    const ref = firebase.database().ref(`users/${this.props.challenge.createdBy}`)
    return ref.once('value', (snapshot) => {
      const challenger = snapshot.val()
      this.setState({ challenger })
    })
  }

  // Add participant to challenge
  addParticipant (profile, challenge, ref): void {
    if (!challenge.participants) {
      challenge.participants = []
    }
    return ref.update({
      participants: [ ...challenge.participants, profile.id ]
    })
  }

  // Add like to challenge
  addLike (profile, challenge, ref): void {
    ref.update({
      likeCount: challenge.likeCount + 1,
      likes: [ ...challenge.likes, profile.id ]
    })
    .then(() => {
      this.setRightButtons(true)
    })
  }

  // Remove like from challenge
  removeLike (profile, challenge, ref): void {
    ref.update({
      likeCount: challenge.likeCount - 1,
      likes: challenge.likes.filter((userId) => userId !== profile.id)
    })
    .then(() => {
      this.setRightButtons(false)
    })
  }

  // get icon for description toggle
  getDescriptionIcon (): string {
    return this.state.showDescription ? 'ios-arrow-dropup' : 'ios-arrow-dropdown'
  }

  // Render cover image
  renderCoverImage (): View {
    return (
      <View style={styles.coverContainer}>
        {this.props.challenge.photo
        ? (
          <Image
            source={{ uri: this.props.challenge.photo }}
            style={styles.coverImage} />
        ) : (
          <Logo size={150} style={{ alignSelf: 'center', marginTop: 65 }} />
        )}
      </View>
    )
  }

  // Render title with gradient background
  renderTitle (): LinearGradient {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', '#fff']}
        style={styles.titleContainer}>
        <View>
          <H1
            style={StyleSheet.flatten(styles.title)}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {this.props.challenge.name}
          </H1>
          <H2 style={StyleSheet.flatten(styles.subtitle)}>
            {I18n.t(this.props.challenge.category)}
          </H2>
        </View>
      </LinearGradient>
    )
  }

  // Render navigation segment
  renderSegment (): Segment {
    return (
      <Segment style={StyleSheet.flatten(styles.segment)}>
        <Button first active>
          <Text>{I18n.t('detail')}</Text>
        </Button>
        <Button last onPress={this.onMessagesPress.bind(this)}>
          <Text>{I18n.t('messages')}</Text>
        </Button>
      </Segment>
    )
  }

  // Render description and bounty
  renderDescriptionAndBounty (): Row {
    return (
      <Row style={StyleSheet.flatten(styles.descriptionContainer)}>
        <View style={{ flex: 0.65, paddingRight: 16 }}>
          <Text numberOfLines={this.state.showDescription ? null : 1}>
            {this.props.challenge.description}
          </Text>
          <Button
            onPress={() => this.setState({ showDescription: !this.state.showDescription })}
            style={{ paddingLeft: 0 }}
            transparent>
            {/* <Icon color='' name={this.getDescriptionIcon()} size={16} /> */}
            <Text> {I18n.t('full_description')} ...</Text>
          </Button>
        </View>
        <View style={styles.bountyContainer}>
          <Text style={StyleSheet.flatten(styles.bountyLabel)}>
            {I18n.t('total_bounty')}
          </Text>
          <Row style={{ alignSelf: 'flex-end', alignItems: 'center' }}>
            <Text style={{ fontSize: 32, lineHeight: 32 }}>
              {this.props.challenge.bounty}
            </Text>
            <Text style={{ fontSize: 18, lineHeight: 18 }}>
              {this.props.challenge.currency || 'CZK'}
            </Text>
          </Row>
        </View>
        {/*
        <View style={{ flex: 0.2 }}>
          <TouchableOpacity onPress={this.onShowMapPress.bind(this)}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="ios-map" size={32} color={colors.darkText.secondary }/>
              <Text style={{ fontSize: 13, color: colors.darkText.secondary }}>{I18n.t('show_map')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        */}
      </Row>
    )
  }

  // Render challenger
  renderChallenger (): Row {
    return this.state.challenger
    ? (
      <Row style={StyleSheet.flatten([{ alignItems: 'center' }, styles.descriptionContainer ])}>
        <Row>
          <Image
            source={{ uri: this.state.challenger.user.picture.data.url }}
            style={{ marginRight: 16, width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }} />
          <View>
            <Text style={{ color: colors.darkText.secondary }}>
              {I18n.t('challenger')}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
              {this.state.challenger.user.name}
            </Text>
          </View>
        </Row>
        <Text>{this.state.challenger.karma || 0}</Text>
      </Row>
    ) : null
  }

  // Render footer
  renderFooter (): Row {
    if (!this.state.challenger) {
      return null
    }
    return (
      <Row>
        <Button transparent onPress={this.onRaiseBountyPress.bind(this)}>
          <Text>{I18n.t('raise_bounty').toUpperCase()}</Text>
        </Button>
        {this.props.challenge.createdBy !== this.state.challenger.user.id
        ? (
          <Button transparent onPress={this.onParticipatePress.bind(this)}>
            <Text>{I18n.t('participate').toUpperCase()}</Text>
          </Button>
        ) : null}
      </Row>
    )
  }

  render () {
    return (
      <Container>
        <Content onScroll={this.onScroll.bind(this)}>
          {this.renderCoverImage()}
          {this.renderTitle()}
          <View style={{ top: -120, paddingHorizontal: 16, paddingVertical: 12 }}>
            {this.renderSegment()}
            {this.renderDescriptionAndBounty()}
            {this.renderChallenger()}
            {this.renderFooter()}
          </View>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  coverContainer: {
    backgroundColor: colors.cyan['300'],
    height: 360,
    left: 0,
    right: 0,
    top: 0
  },
  coverImage: {
    flex: 1,
    resizeMode: 'cover'
  },
  titleContainer: {
    flex: 1,
    height: 120,
    justifyContent: 'flex-end',
    top: -120
  },
  title: {
    color: colors.black,
    fontSize: 60,
    fontWeight: 'bold',
    lineHeight: 60,
    overflow: 'hidden',
    paddingHorizontal: 16
  },
  subtitle: {
    color: colors.darkText.secondary,
    left: 20
  },
  segment: {
    borderBottomWidth: 0,
    marginBottom: 12
  },
  descriptionContainer: {
    borderBottomColor: colors.darkText.dividers,
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingBottom: 12
  },
  bountyContainer: {
    flex: 0.35,
    height: 60,
    overflow: 'hidden'
  },
  bountyLabel: {
    color: colors.darkText.secondary,
    paddingBottom: 5,
    textAlign: 'right'
  }
})

export default ChallengeDetail
