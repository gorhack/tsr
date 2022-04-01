#!/bin/sh

set -eu pipefail

if [ -z "$GITHUB_WORKSPACE" ]; then
  echo "Set the GITHUB_WORKSPACE env variable."
  exit 1
fi

if [ -z "$GITHUB_REPOSITORY" ]; then
  echo "Set the GITHUB_REPOSITORY env variable."
  exit 1
fi

cd client || exit 1
echo "******* Testing Frontend"
yarn install
yarn lint:ci
CI=true yarn test