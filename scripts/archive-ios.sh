#!/bin/bash
./scripts/info.sh "Building archive"
xcodebuild archive \
  -project "ios/BountyLandApp.xcodeproj" \
  -scheme "$1" \
  -sdk "$2" \
  -derivedDataPath "ios/build" \
  -quiet \
  -archivePath "ios/build/Products/BountyLandApp.xcarchive"
