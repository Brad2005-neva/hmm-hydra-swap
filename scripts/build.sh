#!/usr/bin/env bash

if [[ -z "$MAINNET"  ]]; then 
  ./turbo.sh build $@
else
  ./turbo.sh build --no-cache --force $@
fi
