#!/bin/bash

set -e

IMAGE_NAME=ghcr.io/hydraswap-io/hydraswap-ci:0.0.24

./prepare.sh

if command -v docker >/dev/null && ! [[ -n $SKIP_DOCKER ]]
then 
  echo "running anchor build with docker..."
  # Verifiable build does not work for us because of a few factors
  # including our monorepo setup our dependencies and the docker 
  # environment we are using.
  # We can simply ensure builds are done within a canonical 
  # docker environment to do effectively the same thing
  # The stat command ensures the output has the correct privileges after the build
  PARENT=$(dirname $(pwd))

  docker run \
    -v $PARENT:/workdir \
    -w /workdir/core \
    $IMAGE_NAME bash -c "anchor build && chown -R $(stat -c %u:%g .) ./target"
  echo "anchor build finished"
else
  echo "running anchor build with default environment"
  anchor build
fi
