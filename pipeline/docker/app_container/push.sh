#!/usr/bin/env bash

# push to docker packages
echo $DOCKER_GITHUBPKG_ACCESS_TOKEN | docker login https://docker.pkg.github.com -u $DOCKER_GITHUBPKG_USERNAME --password-stdin
docker push docker.pkg.github.com/gorhack/tsr/app-container
docker logout

# push to docker.io
echo $DOCKER_ACCESS_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin
docker push g0rak/tsr
docker logout