#!/bin/sh
if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "This is a pull request. No deployment will be done."
  exit 0
fi
if [[ "$TRAVIS_BRANCH" != "master" ]]; then
  echo "Testing on a branch other than master. No deployment will be done."
  exit 0
fi

if [ "$TRAVIS_OS_NAME" == "osx" ]; then
  ./scripts/export-archive-ios.sh
else
  echo "No after success on linux"
  exit 0
fi

