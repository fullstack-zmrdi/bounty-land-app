#!/bin/sh
if [ "$TRAVIS_OS_NAME" == "osx" ]; then

  KEYCHAIN_PASSWORD="travis"
  KEYCHAIN_NAME="ios-build.keychain"
  PROVISIONING_PROFILE_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"

  ./scripts/info.sh "Decrypt certificates and provisioning profiles"
  openssl aes-256-cbc -k "$ENCRYPTION_SECRET" -in ios/signing/profile.mobileprovision.enc -d -a -out ios/signing/profile.mobileprovision
  openssl aes-256-cbc -k "$ENCRYPTION_SECRET" -in ios/signing/dist.cer.enc -d -a -out ios/signing/dist.cer
  openssl aes-256-cbc -k "$ENCRYPTION_SECRET" -in ios/signing/dist.p12.enc -d -a -out ios/signing/dist.p12

  ./scripts/info.sh "Setup keychain"
  security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME" # Create a custom keychain
  security default-keychain -s "$KEYCHAIN_NAME" # Make the custom keychain default
  security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"  # Unlock the keychain
  security set-keychain-settings -t 3600 -l "$KEYCHAIN_NAME" # Set keychain timeout to 1 hour

  ./scripts/info.sh "Import certificates into keychain"
  security import ios/signing/apple.cer -k "$KEYCHAIN_NAME" -A
  security import ios/signing/dist.cer -k "$KEYCHAIN_NAME" -A
  security import ios/signing/dist.p12 -k "$KEYCHAIN_NAME" -P $KEY_PASSWORD -A

  # Fix for OS X Sierra that hungs in the codesign step
  security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME" > /dev/null

  # Put the provisioning profile in place
  ./scripts/info.sh  "Copy provisioning profile"
  mkdir -p "$PROVISIONING_PROFILE_DIR"
  cp "ios/signing/profile.mobileprovision" "$PROVISIONING_PROFILE_DIR"
else
  ./scripts/info.sh  "No before script on linux"
  exit 0
fi
