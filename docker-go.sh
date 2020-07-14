#!/usr/bin/env bash

# =============================================================================== Docker

if [[ ! $(which docker-compose) ]]; then
    printf "\n\nChecking docker-compose...\n\n"
    #Linux
    if [[ ${operatingSystem} == "Linux" ]]; then
        sudo apt-get install \
            apt-transport-https \
            ca-certificates \
            curl \
            gnupg-agent \
            software-properties-common

        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

        sudo add-apt-repository \
           "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
           $(lsb_release -cs) \
           stable"

        sudo apt-get update

        sudo apt-get install docker-ce docker-ce-cli containerd.io
        sudo usermod -a -G docker $USER
        $printf "Installed Docker and added $USER to group. If you haven't already, log out and log back in"

# =============================================================================== Docker-compose

        sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose

    #Mac
    elif [[ ${operatingSystem} == "Darwin" ]]; then
        if [ ! $(which docker) ]; then
            printf "\n\nInstalling Docker\n\n"
        brew cask install docker
        fi
        printf "\n\n\n==========================================================================================================================================================\n"
        $readTheThings "You must manually grant docker permissions.  Please launch Docker to complete installation and then press Enter when complete..."
    fi
fi
# =============================================================================== Get images from the repo
printf "\nEnter your Gitlab Username followed by your password (or a personal access token)\n"
loginStatus=1
while [[ ${loginStatus} != 0 ]]; do
    docker login registry.master.forcenex.us
    loginStatus=$?
done

docker pull postgres:12.2-alpine
# =============================================================================== Start services and index elasticsearch
printf "\n\n\nStarting containers\n\n\n"

docker-compose up -d
