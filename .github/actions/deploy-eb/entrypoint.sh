#!/bin/sh

set -eou pipefail

if [[ -z "$GITHUB_WORKSPACE" ]]; then
  echo "Set the GITHUB_WORKSPACE env variable."
  exit 1
fi

if [[ -z "$GITHUB_REPOSITORY" ]]; then
  echo "Set the GITHUB_REPOSITORY env variable."
  exit 1
fi

if [[ -z "$AWS_ACCESS_ID" ]]; then
  echo "Set the AWS_ACCESS_ID env variable."
#  exit 1
fi

if [[ -z "$AWS_SECRET_KEY" ]]; then
  echo "Set the AWS_SECRET_KEY env variable."
#  exit 1
fi


echo "******* Installing EB CLI"
# https://github.com/aws/aws-elastic-beanstalk-cli-setup
build-essential zlib1g-dev libssl-dev libncurses-dev libffi-dev libsqlite3-dev libreadline-dev libbz2-dev
git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git
./aws-elastic-beanstalk-cli-setup/scripts/bundled_installer
apt-get install \
    build-essential zlib1g-dev libssl-dev libncurses-dev \
    libffi-dev libsqlite3-dev libreadline-dev libbz2-dev

echo "******* Deploying to AWS EB"
cd $GITHUB_WORKSPACE/remote-docker
eb init -p docker tsr
eb deploy