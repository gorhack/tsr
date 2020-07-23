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

echo "******* Installing EB CLI"
# https://github.com/aws/aws-elastic-beanstalk-cli-setup
apt-get -y update \
    && apt-get -y install \
    git build-essential zlib1g-dev libssl-dev libncurses-dev \
    libffi-dev libsqlite3-dev libreadline-dev libbz2-dev curl
git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git
./aws-elastic-beanstalk-cli-setup/scripts/bundled_installer
echo 'export PATH="/github/home/.ebcli-virtual-env/executables:$PATH"' >> /github/home/.bash_profile
echo 'export PATH=/github/home/.pyenv/versions/3.7.2/bin:$PATH' >> /github/home/.bash_profile && source /github/home/.bash_profile

echo "******* Deploying to AWS EB"
cd "$GITHUB_WORKSPACE"/pipeline/eb || exit 1
mv ./*.jar tsr.jar
echo "$SHA8"
eb deploy tracked-events --label ${$SHA8::8}