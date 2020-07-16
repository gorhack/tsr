#!/bin/bash
set -eou pipefail

(cd client; yarn install;yarn lint:ci; CI=true yarn test;)
./gradlew clean build

(cd client;CI=true yarn build)
./gradlew assemble