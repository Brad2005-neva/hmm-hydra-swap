#!/bin/bash 

NAME=$1

if [[ -z "$NAME" ]]; then 
  echo "No deployment name passed in"
  exit 1
fi

cd ../ && cp $NAME.fleek.json .fleek.json