#!/bin/bash

set -eou pipefail

if [[ -z "$GITHUB_WORKSPACE" ]]; then
  echo "Set the GITHUB_WORKSPACE env variable."
  exit 1
fi

if [[ -z "$GITHUB_REPOSITORY" ]]; then
  echo "Set the GITHUB_REPOSITORY env variable."
  exit 1
fi

if [[ -z "$AWS_ACCESS_KEY_ID" ]]; then
  echo "Set the AWS_ACCESS_ID env variable."
  exit 1
fi

if [[ -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "Set the AWS_SECRET_KEY env variable."
  exit 1
fi

echo "******* Deploying to AWS EB"
cd "$GITHUB_WORKSPACE"/pipeline/eb || exit 1
mv ./tsr/*.jar ./tsr.jar
echo "commit $SHA8"
eb deploy tracked-events
#eb deploy tracked-events --label "${$SHA8::8}"