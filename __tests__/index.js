import 'react-native'
import React from 'react'
import Index from '../app/scenes/About/index.js'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('renders correctly', (done) => {
  const tree = renderer.create( // eslint-disable-line
    <Index />
  )
  done()
})
