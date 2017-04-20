#!/bin/bash
TRAVIS_BRANCH="${TRAVIS_BRANCH:="local"}"
TRAVIS_BUILD_NUMBER="${TRAVIS_BUILD_NUMBER:="10000"}"
COMMIT_MSG="Travis build $TRAVIS_BUILD_NUMBER pushed a tag."
REPOSITORY="fullstack-zmrdi/bounty-land-app"

if [ -z "$TRAVIS_TAG" ]; then

    echo -e "Starting to tag commit.\n"

    git config --global user.email "bounty-land-travis-ci-bot@users.noreply.github.com"
    git config --global user.name "Bounty Land Travis-ci bot"
fi

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  # Android
  ./scripts/info.sh "current android version: $ANDROID_VERSION"

  GRADLE_PATH=android/app/build.gradle # path to the gradle file
  GRADLE_FIELD="versionName" # field name
  ANDROID_VERSION_TMP=$(grep $GRADLE_FIELD $GRADLE_PATH | awk '{print $2}') # get value versionName"0.1.0"

  export NEW_ANDROID_VERSION=$(echo $ANDROID_VERSION_TMP | sed -e 's/^"//'  -e 's/"$//') # remove quotes 0.1.0

  if [[ "$ANDROID_VERSION" != "$NEW_ANDROID_VERSION" ]]; then
    ANDROID_GIT_TAG="release/android/v$NEW_ANDROID_VERSION"
    ./scripts/info.sh "have new android version: $NEW_ANDROID_VERSION"
    ./scripts/info.sh "android release tag: $ANDROID_GIT_TAG"

    travis env set ANDROID_VERSION "$NEW_ANDROID_VERSION" -P --skip-completion-check --skip-version-check -r "$REPOSITORY"
    git tag -a "$ANDROID_GIT_TAG" -m "$COMMIT_MSG"
    git push "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$REPOSITORY" --tags
    ./scripts/info.sh "new tag pushed to origin"
  else
    ./scripts/info.sh "android version is same"
  fi
fi

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  # iOS
  ./scripts/info.sh "current ios version: $IOS_VERSION"

  export NEW_IOS_VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" ios/BountyLandApp/Info.plist)

  if [[ "$IOS_VERSION" != "$NEW_IOS_VERSION" ]]; then
    IOS_GIT_TAG="release/ios/v$NEW_IOS_VERSION"

    ./scripts/info.sh "have new ios version: $NEW_IOS_VERSION"
    ./scripts/info.sh "ios release tag: $IOS_GIT_TAG"

    travis env set IOS_VERSION "$NEW_IOS_VERSION" -P --skip-completion-check --skip-version-check -r "$REPOSITORY"
    git tag -a "$IOS_GIT_TAG" -m "$COMMIT_MSG"
    git push "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$REPOSITORY" --tags
    ./scripts/info.sh "new tag pushed to origin"

  else
    ./scripts/info.sh "ios version is same"
  fi
fi

if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "This is a pull request. No deployment will be done."
  exit 0
fi
if [[ "$TRAVIS_BRANCH" != "master" ]]; then
  echo "Testing on a branch other than master. No deployment will be done."
  exit 0
fi


