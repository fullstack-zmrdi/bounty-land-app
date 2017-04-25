import {
  AddChallengeDetails,
  ChallengeAdded,
  SelectLocation,
  TakePicture
} from './AddChallenge'

import About from './About'
import CameraRoll from './CameraRoll'
import ChallengeDetail from './ChallengeDetail'
import ChallengeMessages from './ChallengeDetail/Messages'
import Challenges from './Challenges'
import Cover from './ChallengeDetail/Cover'
import Drawer from './Drawer'
import Home from './Home'
import { Navigation } from 'react-native-navigation'
import Profile from './Profile'
import RaiseBountyModal from './ChallengeDetail/RaiseBounty'
import SignIn from './SignIn'
import Wallet from './Wallet'

export const registerScreens = (): void => {
  Navigation.registerComponent('SIGN_IN', () => SignIn)
  Navigation.registerComponent('PROFILE', () => Profile)
  Navigation.registerComponent('DRAWER', () => Drawer)
  Navigation.registerComponent('ABOUT', () => About)
  Navigation.registerComponent('HOME', () => Home)
  Navigation.registerComponent('ADD_CHALLENGE', () => AddChallengeDetails)
  Navigation.registerComponent('TAKE_PICTURE', () => TakePicture)
  Navigation.registerComponent('SELECT_LOCATION', () => SelectLocation)
  Navigation.registerComponent('CHALLENGE_ADDED', () => ChallengeAdded)
  Navigation.registerComponent('CAMERA_ROLL', () => CameraRoll)
  Navigation.registerComponent('CHALLENGE_DETAIL', () => ChallengeDetail)
  Navigation.registerComponent('COVER', () => Cover)
  Navigation.registerComponent('CHALLENGE_MESSAGES', () => ChallengeMessages)
  Navigation.registerComponent('RAISE_BOUNTY', () => RaiseBountyModal)
  Navigation.registerComponent('CHALLENGES', () => Challenges)
  Navigation.registerComponent('WALLET', () => Wallet)
}
