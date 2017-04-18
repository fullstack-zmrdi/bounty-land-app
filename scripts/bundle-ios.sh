#!/bin/bash
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH
CLI=../node_modules/react-native/local-cli/cli.js
echo "Create js bundle into $DEST"

node "$CLI" bundle \
  --entry-file index.ios.js \
  --platform ios \
  --dev false \
  --reset-cache \
  --bundle-output "$DEST/main.jsbundle" \
  --assets-dest "$DEST"
