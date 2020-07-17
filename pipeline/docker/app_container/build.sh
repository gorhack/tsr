#!/usr/bin/env bash

# If script is run in pipeline, these will be set
dockerImageName="docker.pkg.github.com/gorhack/tsr/app-container:latest"

if [[ -n $GITHUB_REPOSITORY ]]; then
  dockerImageName="docker.pkg.github.com/$GITHUB_REPOSITORY:$GITHUB_REF"
  cp build/libs/tsr-* ./pipeline/docker/app_container/tsr.jar
  docker build -t $dockerImageName ./pipeline/docker/app_container/
  rm ./pipeline/docker/app_container/tsr.jar
else
  cp ../../../build/libs/tsr-* ./tsr.jar
  docker build -t $dockerImageName .
  rm tsr.jar
fi