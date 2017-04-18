#!/bin/bash
./scripts/info.sh "Exporting archive"
xcodebuild -exportArchive \
  -archivePath "ios/build/Products/BountyLandApp.xcarchive" \
  -exportOptionsPlist "ios/signing/exportOptions.plist" \
  -exportPath "ios/build/Products"
