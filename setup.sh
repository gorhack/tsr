#!/usr/bin/env bash

set -e

promptAndWaitForAnyKeyPress() {
  printf "%s" "$1"
  read -r
}

# =============================================================================== Pre-run warnings
printf "\n\nWARNING: If you didn't run this script with the syntax '. ./setup.sh' or 'source ./setup.sh' you will
need to open a new terminal window or source your bash profile to have the environment variables set. \n\n"

promptAndWaitForAnyKeyPress "If you are happy with how you ran the script then press any key to continue... OR ctrl+c to exit."

printf "\n"

if [[ "$SHELL" == *"bash"* ]]; then
  read -rp "Press 1 to use ~/.bashrc. Press 2 to use ~/.bash_profile?  " opt
  case $opt in
  "1") profileHome=~/.bashrc ;;
  "2") profileHome=~/.bash_profile ;;
  *)
    echo "Please enter 1 or 2"
    exit
    ;;
  esac
elif [[ "$SHELL" == *"zsh"* ]]; then
  profileHome=~/.zshrc
fi

# =============================================================================== Detect system

operatingSystem=$(uname -s)
printf "\n\nDetected Operating System: '%s'\n\n" "$operatingSystem"

# =============================================================================== Brew(Mac Only)

if [[ ${operatingSystem} == "Darwin" ]]; then
  if ! command -v brew &> /dev/null ; then
    printf "\n\nHomeBrew installation not detected: Installing Brew!\n\n"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  else
    brew update
  fi

# =============================================================================== Sudo(Linux Only)

elif [[ ${operatingSystem} == "Linux" ]]; then
  printf "\n\nUpdating Repositories...\n\n"
  sudo apt-get update
fi

# =============================================================================== Yarn

if ! command -v yarn &> /dev/null; then
  printf "\n\nYarn installation not found: Installing Yarn!\n\n"
  if [[ ${operatingSystem} == "Linux" ]]; then
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update
    sudo apt-get install yarn
  elif [[ ${operatingSystem} == "Darwin" ]]; then
    brew install yarn
  fi
fi

# =============================================================================== Direnv

if ! command -v direnv &> /dev/null; then
  printf "\n\ndirenv installation not found: Installing direnv!\n\n"
  if [[ ${operatingSystem} == "Linux" ]]; then
    sudo apt-get install direnv
  elif [[ ${operatingSystem} == "Darwin" ]]; then
    brew install direnv
  fi
fi

# =============================================================================== Java 15

if ! grep -q "JAVA_HOME.*adoptopenjdk-15" "$profileHome"; then
  if [ -z "${JAVA_HOME+x}" ]; then
    printf "JAVA_HOME previously set to an incorrect version, you may have to remove previous env from '%s'" "$profileHome"
  fi
  printf "\n\nSetting JAVA_HOME\n\n"
  if [[ ${operatingSystem} == "Darwin" ]]; then
    JAVA_HOME="/Library/Java/JavaVirtualMachines/adoptopenjdk-15.jdk/Contents/Home"
  elif [[ ${operatingSystem} == "Linux" ]]; then
    JAVA_HOME="/usr/java/jdk-15"
    # if using Ubuntu 20.04 LTS JAVA_HOME=/usr/lib/jvm/java-15-openjdk-amd64
  fi
  echo "export JAVA_HOME=$JAVA_HOME" >>$profileHome
  printf "\n\nAdding JAVA_HOME to PATH\n\n"
  echo "export PATH=$PATH:$JAVA_HOME/bin" >>$profileHome
fi

installOpenJDKMac() {
  printf "\n\nTapping AdoptOpenJDK...\n\n"
  brew tap AdoptOpenJDK/openjdk
  printf "\n\nInstalling OpenJDK15...\n\n"
  brew install --cask adoptopenjdk15
}

installOpenJDKUbuntu() {
  printf "Downloading OpenJDK15 tar"
  curl https://download.java.net/openjdk/jdk15/ri/openjdk-15+36_linux-x64_bin.tar.gz --output openjdk-15+36_linux-x64_bin.tar.gz
  sudo mkdir -p /usr/java
  sudo tar -xzf openjdk-15+36_linux-x64_bin.tar.gz -C /usr/java
  rm openjdk-15+36_linux-x64_bin.tar.gz
  sudo update-alternatives --install /usr/bin/java java "${JAVA_HOME%*/}"/bin/java 20000
  sudo update-alternatives --install /usr/bin/javac javac "${JAVA_HOME%*/}"/bin/javac 20000
  sudo update-alternatives --config java
  sudo update-alternatives --config javac
}

printf "\n\nChecking Java installation and JAVA_PATH...\n\n"

if ! command -v java &> /dev/null; then
  printf "\n\nJava installation not found: Installing Java!\n\n"
  if [[ ${operatingSystem} == "Linux" ]]; then
    installOpenJDKUbuntu
  elif [[ ${operatingSystem} == "Darwin" ]]; then
    installOpenJDKMac
  fi
else
  FULL_JAVA_VER=$(java -version 2>&1 | sed -n ';s/.* version "\(.*\)\"/\1/p;' | cut -c1-6)
  JAVA_VER=$(echo "$FULL_JAVA_VER" | cut -c1-2)
  if [[ ${JAVA_VER} != "15" ]]; then
    printf "\n\nFound Java installation with incorrect version: Installing OpenJDK15!\n\n"
    if [[ ${operatingSystem} == "Linux" ]]; then
      installOpenJDKUbuntu
    elif [[ ${operatingSystem} == "Darwin" ]]; then
      installOpenJDKMac
    fi
  fi
fi

# =============================================================================== Geckodriver

if [[ -z $(which geckodriver) && "${operatingSystem}" == "Darwin" ]]; then
  printf "\n\nInstalling geckodriver...\n\n"
  brew install geckodriver
fi

if ! grep -q "direnv hook" "${profileHome}"; then
    echo "eval \"\$(direnv hook ${SHELL})\"" >>$profileHome
fi

printf "\n\nRequired software downloaded successfully.\n\n"

./docker_go.sh

## =============================================================================== Linking dependencies
printf "\n\n\nLinking dependencies...\n\n\n"

pushd client || exit
yarn install
yarn build
popd || exit

./gradlew clean assemble

printf "\n\n\nYour setup is complete.\nYou may need to run a direnv allow to approve the contents of .envrc\n\n"
