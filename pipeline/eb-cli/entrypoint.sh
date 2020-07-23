#!/bin/bash

set -eou pipefail

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