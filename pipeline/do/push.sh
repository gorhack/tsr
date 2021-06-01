#!/usr/bin/env bash

# push to docker.io
echo $DOCKER_ACCESS_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin
docker push g0rak/tsr-app
docker logout