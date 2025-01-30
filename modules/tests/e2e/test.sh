#!/bin/bash

set -e

TEST=$1

if [ -n "$HEADED" ]; then
  echo "User requested headed mode via override"
  yarn playwright test $TEST
elif [ -z "$(which xvfb-run)" ]; then
  echo "no xvfb found running in headed mode by default"
  yarn playwright test $TEST
else
  echo "xvfb found running headless"
  xvfb-run --auto-servernum -- yarn playwright test $TEST
fi
