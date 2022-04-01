#!/usr/bin/env bash

set -e

# Read a single char from /dev/tty, prompting with "$*"
# Note: pressing enter will return a null string. Perhaps a version terminated with X and then remove it in caller?
# See https://unix.stackexchange.com/a/367880/143394 for dealing with multi-byte, etc.
function get_keypress {
  local REPLY IFS=
  >/dev/tty printf '%s' "$*"
  [[ $ZSH_VERSION ]] && read -rk1  # Use -u0 to read from STDIN
  # See https://unix.stackexchange.com/q/383197/143394 regarding '\n' -> ''
  [[ $BASH_VERSION ]] && </dev/tty read -rn1
  printf '%s' "$REPLY"
}

# Get a y/n from the user, return yes=0, no=1 enter=$2
# Prompt using $1.
# If set, return $2 on pressing enter, useful for cancel or defualting
function get_yes_keypress {
  local prompt="${1:-Are you sure} [y/n]? "
  local enter_return=$2
  local REPLY
  # [[ ! $prompt ]] && prompt="[y/n]? "
  while REPLY=$(get_keypress "$prompt"); do
    [[ $REPLY ]] && printf '\n' # $REPLY blank if user presses enter
    case "$REPLY" in
      Y|y)  return 0;;
      N|n)  return 1;;
      '')   [[ $enter_return ]] && return "$enter_return"
    esac
  done
}

# Credit: http://unix.stackexchange.com/a/14444/143394
# Prompt to confirm, defaulting to NO on <enter>
# Usage: confirm "Dangerous. Are you sure?" && rm *
function confirm {
  local prompt="${*:-Are you sure} [y/N]? "
  get_yes_keypress "$prompt" 1
}

# Prompt to confirm, defaulting to YES on <enter>
function confirm_yes {
  local prompt="${*:-Are you sure}"
  get_yes_keypress "$prompt" 0
}

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
    confirm_yes "Install Homebrew? Will require manual setup if no." || exit 1
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

# =============================================================================== Node

if ! command -v node &> /dev/null; then
  printf "\n\nNode installation not found.\n\n"
  if confirm_yes "Install node?"; then
    if [[ ${operatingSystem} == "Linux" ]]; then
      sudo snap install node --classic
    elif [[ ${operatingSystem} == "Darwin" ]]; then
      brew install node
    fi
  fi
fi

# =============================================================================== Yarn

if ! command -v yarn &> /dev/null; then
  printf "\n\nYarn installation not found.\n\n"
  if confirm_yes "Install yarn globally with homebrew?"; then
    if [[ ${operatingSystem} == "Linux" ]]; then
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo apt-get update
      sudo apt-get install yarn
    elif [[ ${operatingSystem} == "Darwin" ]]; then
      brew install yarn
    fi
  fi
fi

# =============================================================================== Direnv

if ! command -v direnv &> /dev/null; then
  printf "\n\ndirenv installation not found.\n\n"
  if confirm_yes "Install direnv to manage TSR's environment variables?"; then
    if [[ ${operatingSystem} == "Linux" ]]; then
      sudo apt-get install direnv
    elif [[ ${operatingSystem} == "Darwin" ]]; then
      brew install direnv
    fi
    if ! grep -q "direnv hook" "${profileHome}"; then
      echo "eval \"\$(direnv hook ${SHELL})\"" >>$profileHome
    fi
  fi
fi

# =============================================================================== Java 17

installOpenJDKMac() {
  if confirm_yes "Would you like to install OpenJDK17 with homebrew and manage Java with the jenv package?"; then
    printf "\n\nTapping Adoptium (AdoptOpenJDK)...\n\n"
    brew install jenv
    # configure jenv
    jenv init -
    printf "Added jenv to your PATH in %s" $profileHome
    echo "export PATH=""$HOME""/.jenv/bin:""$PATH""" >> $profileHome
    echo "eval ""$(jenv init -)""" >> $profileHome
    # add or replace $JAVA_HOME
    if ! grep -q "JAVA_HOME" "${profileHome}"; then
      printf "Added JAVA_HOME to your %s" $profileHome
      echo "JAVA_HOME=""$HOME""/.jenv/shims/java" >>$profileHome
    else
      sed -i '' 's#^JAVA_HOME=.*$#JAVA_HOME="$HOME/.jenv/shims/java"#' $profileHome
    fi
    # If upgrading from previous adoptopenjdk versions of java in setup, uninstall
    printf "AdoptOpenJDK has been officially discontinued upstream.
To remove previous installations run the following:
    brew uninstall adoptopenjdk15
    brew untap AdoptOpenJDK/openjdk
    "
    brew tap homebrew/cask-versions
    printf "\n\nInstalling AdoptOpenJDK17...\n\n"
    brew install --cask temurin17
    # configure jenv with temurin17 installation
    jenv add /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
    jenv local openjdk64-17.0.2
  else
    printf "Please setup Java17's manual configuration then rerun the setup script."
    exit 1
  fi
}

installOpenJDKUbuntu() {
  # uses `update-alternatives` to manage java versions
  if confirm_yes "Would you like to install OpenJDK17?"; then
    printf "Downloading OpenJDK17 tar"
    curl https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz --output openjdk-17_linux-x64_bin.tar.gz
    sudo mkdir -p /usr/java
    sudo tar -xzf openjdk-17_linux-x64_bin.tar.gz -C /usr/java
    rm openjdk-17_linux-x64_bin.tar.gz
    JAVA_HOME="/usr/java/jdk-17.0.2"
    if ! grep -q "JAVA_HOME" "${profileHome}"; then
      printf "Added JAVA_HOME to your %s" $profileHome
      echo "JAVA_HOME=$JAVA_HOME" >>$profileHome
    else
      sed -i 's#^JAVA_HOME=.*$#JAVA_HOME=/usr/java/jdk-17.0.2#' $profileHome
    fi
    sudo update-alternatives --install /usr/bin/java java "${JAVA_HOME%*/}"/bin/java 20000
    sudo update-alternatives --install /usr/bin/javac javac "${JAVA_HOME%*/}"/bin/javac 20000
    sudo update-alternatives --config java
    sudo update-alternatives --config javac
  else
    printf "Please setup Java17's manual configuration then rerun the setup script."
    exit 1
  fi
}

printf "\n\nChecking Java installation...\n\n"

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
  if [[ ${JAVA_VER} != "17" ]]; then
    printf "\n\nFound Java installation with incorrect version: %s: Installing OpenJDK17!\n\n" "$FULL_JAVA_VER"
    if [[ ${operatingSystem} == "Linux" ]]; then
      installOpenJDKUbuntu
    elif [[ ${operatingSystem} == "Darwin" ]]; then
      installOpenJDKMac
    fi
  fi
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
