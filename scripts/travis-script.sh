#!/bin/bash
if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  cd ./android && ./gradlew assembleRelease -q -S && cd ../;
else
  ./scripts/archive-ios.sh BountyLandAppRelease iphoneos;
  ./scripts/export-archive-ios.sh;
fi
