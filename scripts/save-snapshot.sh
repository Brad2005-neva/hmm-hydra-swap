#!/usr/bin/env bash

set -e

NAME=$1
CMD=${@:2}

if [[ -z "$NAME" ]]; then
  echo "You must provide a name."
  exit 1
fi

# snapshots are only used in testing so we can hardcode our god wallet here
yarn wallet ../keys/users/god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D.json 

yarn val -d --speed medium --start-slot 200000

pushd ../modules/core
./deploy.sh http://localhost:8899
popd

if [[ ! -z "$CMD" ]]; then
  $CMD
fi

yarn val save $NAME -d
yarn val stop