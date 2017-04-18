#!/bin/bash
if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  rm -f  $HOME/.gradle/caches/modules-2/modules-2.lock
  rm -fr $HOME/.gradle/caches/*/plugin-resolution/
  exit 0
else
  echo "No before cache on osx"
  exit 0
fi
