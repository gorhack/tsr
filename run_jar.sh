#!/bin/bash
set -euo pipefail

export PORT=8081

runFrontend=true;
env=default;

echo "about to do args"

while [[ $# -gt 0 ]]
do
echo "in loop $*@"
	case $1 in

    --env)
                    env="$2"
                    shift
                    shift
                    ;;

	  --no-frontend)  runFrontend=false
                    shift ;;

    *)              shift
                    break
                    ;;

	esac
done

echo "done with args"

if [ -z $PORT ] ; then
  echo ""
  echo "******************************************************"
  echo "Port was not set. Setting it to 8080 by default."
  echo "******************************************************"
  echo ""
  export PORT=8080
else
  echo "Running on port $PORT."
fi

export BASE_URL=http://localhost:$PORT

# This will always run when THIS script exits
cleanup() {
  EXIT_CODE=$?
  if [ -f tsr.pid ]; then
     ! kill -9 "$(cat tsr.pid)"
     ! rm -f tsr.pid
  fi
  exit $EXIT_CODE
}
trap cleanup 0

if command -v lsof && lsof -i ":$PORT" ; then
  echo ""
  echo "******************************************************"
  echo "Something is already using port $PORT. Killing it now"
  echo "******************************************************"
  echo ""
  kill "$(lsof -i ":$PORT" | awk '{print $2}' | sed -n '2 p')"
fi

if $runFrontend ; then
  echo ""
  echo "******************************************************"
  echo "starting the front end"
  echo "******************************************************"
  echo ""
  pushd client
  BROWSER=none yarn start > /dev/null 2>&1 &
  popd
fi

echo ""
echo "******************************************************"
echo "starting the backend"
echo "******************************************************"
echo ""


if [[ -z ${CI+x} ]]; then
  # Not in CI
  SPRING_PROFILES_ACTIVE="$env" ./gradlew yarnBuild assemble bootRun --console=plain --args="--server.port=$PORT" &
else
  # In CI
  SPRING_PROFILES_ACTIVE="$env" java -jar -Dserver.port=$PORT ./build/libs/tsr-*.jar &
fi

echo $! > tsr.pid

sleep 20;

attempt=0
while [ $attempt -le 299 ];
do
  attempt=$(( $attempt + 1 ))
  if curl -s -o /dev/null ${BASE_URL}; then
    echo ""
    echo "******************************************************"
    echo "$(date) - connected successfully"
    echo "******************************************************"
    echo ""
    break
  fi
  echo "$(date) - still trying to connect to ${BASE_URL}"
  sleep 1
done

if [ $attempt -eq 300 ]; then
  echo "Timed out while trying to connect to ${BASE_URL}"
  kill -9 "$(jobs -p)"
  exit 1
fi
