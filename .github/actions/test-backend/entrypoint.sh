#!/bin/sh

set -eou pipefail

if [[ -z "$GITHUB_WORKSPACE" ]]; then
  echo "Set the GITHUB_WORKSPACE env variable."
  exit 1
fi

if [[ -z "$GITHUB_REPOSITORY" ]]; then
  echo "Set the GITHUB_REPOSITORY env variable."
  exit 1
fi

cd "$GITHUB_WORKSPACE" || exit 1

RDS_HOSTNAME=$PG_HOST
RDS_PORT=$PG_PORT
TSR_TEST_DB_NAME=$PG_DATABASE
RDS_USERNAME=$PG_USER
RDS_PASSWORD=$PG_PASSWORD
# Run gradle tests
# fail if tests fail
echo "******* Testing Backend"
{
  ./gradlew test --info
} ||
  {
    kill -9 "$(jobs -p)"
    exit 1
  }

# Success if we get this far
exit 0