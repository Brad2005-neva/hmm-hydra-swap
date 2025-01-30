#!/usr/bin/env bash

set -e

yarn val frontend -d
yarn concurrently -r "cd ../app && yarn start" "cd ../modules/services && yarn watch" "cd ../modules/sdk && yarn watch" 
