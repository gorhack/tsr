#!/usr/bin/env bash

cp ../../../build/libs/*.jar ./tsr.jar

docker build -t docker.pkg.github.com/gorhack/tsr/app-container:latest .
docker build -t g0rak/tsr:latest .

rm tsr.jar