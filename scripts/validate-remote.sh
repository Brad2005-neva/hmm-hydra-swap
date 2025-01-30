#!/usr/bin/env bash

NETWORK=$1
REMOTE_ADDRESS=$2
LOCAL_PATH=$3


if [[ -z "$NETWORK" ]]; then
  echo "you must provide a NETWORK"
  exit 1
fi

if [[ -z "$REMOTE_ADDRESS" ]]; then
  echo "you must provide a REMOTE_ADDRESS"
  exit 1
fi

if [[ -z "$LOCAL_PATH" ]]; then
  echo "you must provide a LOCAL_PATH"
  exit 1
fi

DUMPED_FILE=/tmp/_dumped.so
LOCAL_FILE=/tmp/_local.so

rm -rf $DUMPED_FILE $LOCAL_FILE

solana program dump $REMOTE_ADDRESS --url $NETWORK $DUMPED_FILE
cp $LOCAL_PATH $LOCAL_FILE
truncate -r $DUMPED_FILE $LOCAL_FILE

DUMPED_SHA=$(sha256sum $DUMPED_FILE | awk '{ print $1 }')
LOCAL_SHA=$(sha256sum $LOCAL_FILE | awk '{ print $1 }')

if [[ "$LOCAL_SHA" != "$DUMPED_SHA" ]]; then 
  echo "Finger prints DO NOT MATCH!"
  echo 
  echo sha256sum $DUMPED_FILE $LOCAL_FILE
  exit 1
fi

echo "Finger prints match!"
