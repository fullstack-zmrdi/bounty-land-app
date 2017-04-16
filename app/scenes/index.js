import About from './About'
import ChallengeDetail from './ChallengeDetail'
import Challenges from './Challenges'
import Drawer from './Drawer'
import Home from './Home'
import { Navigation } from 'react-native-navigation'
import Profile from './Profile'
import SignIn from './SignIn'
import TakePicture from './AddChallenge/TakePicture'
import SelectLocation from './AddChallenge/SelectLocation'
import ChallengeAdded from './AddChallenge/ChallengeAdded'
import AddChallengeDetails from './AddChallenge/AddDetails'
import Wallet from './Wallet'
import CameraRoll from './CameraRoll'

export const registerScreens = () => {
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
  Navigation.registerComponent('CHALLENGES', () => Challenges)
  Navigation.registerComponent('WALLET', () => Wallet)
}
