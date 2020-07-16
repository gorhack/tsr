#!/bin/bash
set -e

export SPRING_PROFILES_ACTIVE=default

# Copy over the index.html that just redirects to localhost:3000
mkdir -p src/main/resources/static && cp redirect-to-dev-index.html src/main/resources/static/index.html

operatingSystem=$(uname -s)
printf "\n\nDetected Operating System: ${operatingSystem}\n\n"

if [[ ${operatingSystem} == "Darwin" ]]; then
    (trap 'kill 0' SIGINT; ./gradlew bootRun --console=plain & sleep 30; open "http://localhost:8080"; cd client; BROWSER=none yarn start && fg)
elif [[ ${operatingSystem} == "Linux" ]]; then
    (trap 'kill 0' SIGINT; ./gradlew bootRun --console=plain & sleep 30; xdg-open "http://localhost:8080"; cd client; BROWSER=none yarn start && fg)
fi

