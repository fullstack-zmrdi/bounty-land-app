#!/bin/bash
echo "$TRAVIS_OS_NAME"
node --version
gem install travis -v 1.8.8 --no-rdoc --no-ri
if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  echo "Accept Android licenses"
  mkdir "$ANDROID_HOME/licenses" || true
  echo -e "\n8933bad161af4178b1185d1a37fbf41ea5269c55" > "$ANDROID_HOME/licenses/android-sdk-license"
  echo -e "\n84831b9409646a918e30573bab4c9c91346d8abd" > "$ANDROID_HOME/licenses/android-sdk-preview-license"
  exit 0
else
  echo "No before install on osx"
  exit 0
fi


