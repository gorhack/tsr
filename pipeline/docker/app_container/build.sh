#!/usr/bin/env bash

# If script is run in pipeline, these will be set
dockerImageName="docker.pkg.github.com/gorhack/tsr/app-container:latest"

if [[ -n $GITHUB_REPOSITORY ]]; then
  dockerImageName="docker.pkg.github.com/$GITHUB_REPOSITORY:$GITHUB_REF"
fi

cp ../../../build/libs/*.jar ./tsr.jar

docker build -t $dockerImageName .

rm tsr.jar