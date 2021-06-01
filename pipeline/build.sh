#!/usr/bin/env bash
set -euo pipefail

if [ -d "src/main/resources/static" ]; then
  rm -rf src/main/resources/static/*
else
  mkdir -p src/main/resources/static
fi

echo "******* Version Info"
./gradlew -version

echo "******* Building Frontend"
pushd client
rm -rf node_modules
yarn install
yarn build --testPathIgnorePatterns ['*']
popd

echo "******* Building Backend"
./gradlew build -x test

echo "******* Creating jar"
./gradlew bootJar

cp ./build/libs/tsr*.jar ./pipeline/eb/tsr.jar
cp ./build/libs/tsr*.jar ./pipeline/do/tsr.jar

exit 0