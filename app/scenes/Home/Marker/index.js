/* @flow */
import { View, Image, Text, StyleSheet } from 'react-native'
import React from 'react'

import type { Challenge } from '../../../typedef'
import colors from 'material-colors'
import { categoryIcons } from '../../../theme'

const MarkerView = ({
  challenge,
  selectedChallengeId
} : {
  challenge: Challenge,
  selectedChallengeId: ?string
}) => {
  return (
    <View style={styles.markerContainer}>
      {challenge.id === selectedChallengeId
      ? (
        <View style={styles.label}>
          <Text style={{ fontSize: 11 }}>{challenge.name}</Text>
          <Text style={{ fontWeight: 'bold' }}>${challenge.bounty}</Text>
        </View>
      ) : null}
      <Image
        style={styles.categoryImage}
        source={categoryIcons[challenge.category]} />
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    justifyContent: 'center',
    marginLeft: -20,
    paddingLeft: 24,
    borderColor: colors.grey['300'],
    borderWidth: 1,
    paddingRight: 16,
    backgroundColor: colors.grey['100'],
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  },
  markerContainer: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-start'
  },
  categoryImage: {
    width: 40,
    height: 40,
    overflow: 'hidden'
  }
})

export default MarkerView
