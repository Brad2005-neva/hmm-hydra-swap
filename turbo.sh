#!/usr/bin/env bash

set -e

if [[ -z "$*" ]]; then
  echo "No argument provided. "
  exit 1;
fi

## Can only run a single task
TASK=$1
shift 1
TURBO=()
REST=()

for i in "$@"; do
  if [[ "$i" == "--force" ]] || [[ "$i" == *"--filter"* ]] || [[ "$i" == *"--concurrency"* ]] || [[ "$i" == *"--parallel"* ]] || [[ "$i" == *"--no-cache"* ]]; then
    TURBO+=($i)
  else 
    echo "adding to rest..."
    REST+=($i)
  fi
done

./node_modules/.bin/turbo run --cache-dir=.turbocache -v --output-logs=new-only --color ${TURBO[*]}  $TASK -- ${REST[*]}