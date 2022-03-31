#!/bin/bash
set -eou pipefail

(cd client; yarn install;yarn lint:ci; CI=true yarn test;)
./gradlew clean build

# Creates a jar for development/testing only. Not for use in production
# https://stackoverflow.com/questions/16145522/chrome-showing-error-as-refused-to-execute-inline-script-because-of-content-sec
(cd client;CI=true INLINE_RUNTIME_CHUNK=false yarn build)
./gradlew assemble