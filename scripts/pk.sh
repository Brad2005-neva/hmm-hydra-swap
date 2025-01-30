#!/usr/bin/env bash

set -e

WALLET_LOCATION=$1

if [[ -z "${WALLET_LOCATION}" ]]; then
  WALLET_LOCATION=key.json
fi
echo "This script will output a keyfile from a phantom style private key."
echo
echo "Current output location: "
echo "   \"$WALLET_LOCATION\""
echo
echo "You can select a different output location by running this script with an argument."
echo
echo "Enter your private key (will not be shown):"
read -s -p "> " sk
echo $sk | node ./scripts/pk.mjs > $WALLET_LOCATION