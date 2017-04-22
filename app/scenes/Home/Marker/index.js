/* @flow */
import { View, Image, Text } from 'react-native'
import React from 'react'

import type { Challenge } from '../../../typedef'
// import I18n from 'react-native-i18n'
import colors from 'material-colors'

import Toast from '@remobile/react-native-toast'
import I18n from 'react-native-i18n'

const icons = {
  garbage: require('../../../images/icon_garbage.png'),
  fun: require('../../../images/icon_fun.png'),
  deeds: require('../../../images/icon_good_deed.png')

}
const MarkerView = ({ challenge, selectedChallengeId }) => {
  // console.log('render marker', challenge.name, challenge.id)
    return (
      <View style={{     flexDirection: 'row-reverse',
    alignSelf: 'flex-start' }}>

          {challenge.id === selectedChallengeId
          ? (
          <View style={{ justifyContent: 'center', marginLeft: -20, paddingLeft: 24, borderColor: colors.grey['300'], borderWidth: 1, paddingRight: 16, backgroundColor: colors.grey['100'], borderTopRightRadius: 20, borderBottomRightRadius: 20  }}>
            <Text style={{ fontSize: 11 }}>{challenge.name}</Text>
                        <Text style={{ fontWeight: 'bold' }}>${challenge.bounty}</Text>

          </View>
          ) : null}
          <Image
          style={{ width: 40, height: 40, overflow: 'hidden' }}
          source={icons[challenge.category]} />
      </View>
    )
}

export default MarkerView
