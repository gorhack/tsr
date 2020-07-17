#!/usr/bin/env bash

echo $DOCKER_ACCESS_TOKEN | docker login https://docker.pkg.github.com -u $DOCKER_USERNAME --password-stdin
docker push docker.pkg.github.com/gorhack/tsr/app-container
docker logout