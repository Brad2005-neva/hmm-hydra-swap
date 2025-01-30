#!/usr/bin/env bash

source .env

docker build \
  --build-arg RUST_VERSION=${RUST_VERSION} \
  --build-arg ANCHOR_VERSION=${ANCHOR_VERSION} \
  --build-arg SOLANA_VERSION=${SOLANA_VERSION} \
  . -t ${NAME}:${VERSION}
