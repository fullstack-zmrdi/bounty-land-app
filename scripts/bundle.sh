#!/bin/bash
if [ $TRAVIS_BUILD_NUMBER  ]
then
  BUILD_NUMBER="$TRAVIS_BUILD_NUMBER"
else
  BUILD_NUMBER="100000"
fi

echo "Creating jsbundle for platform $1 build number $BUILD_NUMBER"
mkdir -p ".bundles/$1/$BUILD_NUMBER"
react-native bundle --entry-file "index.$1.js" --bundle-output ".bundles/$1/$BUILD_NUMBER/main.jsbundle" --dev "false" --platform "$1" --assets-dest ".bundles/$1/$BUILD_NUMBER" --sourcemap-output ".bundles/$1/$BUILD_NUMBER/main.js.map"
