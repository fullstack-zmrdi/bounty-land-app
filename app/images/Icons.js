import Ionicons from 'react-native-vector-icons/Ionicons'
import { PixelRatio } from 'react-native'
import { themeColors } from '../theme'
const navIconSize = (__DEV__ === false && Platform.OS === 'android') ? PixelRatio.getPixelSizeForLayoutSize(40) : 40; // eslint-disable-line
const replaceSuffixPattern = /--(active|big|small|very-big)/g
// Todo load only icons foractive platform
const icons = {
  'ios-search': [30],
  'ios-arrow-round-down': [navIconSize],
  'ios-arrow-back': [30],
  'ios-heart': [30],
  'ios-heart-outline': [30],
  'ios-close': [40],
  'ios-share-outline': [30],
  'ios-undo': [30],
  'ios-reverse-camera': [30],
  'md-share': [24],
  'md-heart': [24],
  'md-heart-outline': [24],
  'md-menu': [24],
  'md-locate': [24, themeColors.primaryColorDark]
}

const iconsMap = {}
const iconsLoaded = new Promise((resolve, reject) => {
  Promise.all(
    Object.keys(icons).map(iconName =>
      // IconName--suffix--other-suffix is just the mapping name in iconsMap
      Ionicons.getImageSource(
      iconName.replace(replaceSuffixPattern, ''),
      icons[iconName][0],
      icons[iconName][1]
    ))
  ).then(sources => {
    Object.keys(icons)
    .forEach((iconName, idx) => (iconsMap[iconName] = sources[idx]))

    // Call resolve (and we are done)
    resolve(true)
  })
})

export {
  iconsMap,
  iconsLoaded
}
