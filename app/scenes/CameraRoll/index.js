import React, { Component } from 'react'
import { View, CameraRoll, Text } from 'react-native'

class CameraRollScreen extends Component {
  state = {
    photos: []
  }

  componentDidMount () {
    CameraRoll.getPhotos()
    .then((result) => {
      console.log(result)
    })
  }

  render () {
    return (
      <View>
        <Text>Photo count {this.state.photos.length}</Text>
      </View>
    )
  }
}

export default CameraRollScreen
