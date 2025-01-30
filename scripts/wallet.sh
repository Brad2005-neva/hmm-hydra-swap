#!/usr/bin/env bash

# Set ~/.config/id.json to the give keyfile creating a backup
# This should eventually incorporate the private-key.ts script
set -e

DATE=$(date +"%s")
FILE=$1

if [ -z "$FILE" ]; then 
  echo "USAGE:"
  echo ""
  echo " ./scripts/wallet.sh /path/to/keyfile"
  echo ""
  exit 1
fi

# Create a random wallet file if not yet initialized
if [ -z "$(solana-keygen pubkey 2>/dev/null)" ]; then
  solana-keygen new --no-bip39-passphrase
fi

CONFIG=$(solana config get keypair)
OLD_WALLET=$(solana-keygen pubkey)
OLD_PATH=$(echo ${CONFIG:9})

echo ""
echo " ${OLD_PATH}"
echo ""

cp $OLD_PATH ~/.config/solana/${OLD_WALLET}.json
rm ~/.config/solana/id.json
cp $FILE ~/.config/solana/id.json
solana config set --keypair ~/.config/solana/id.json

if [ -z "$(solana-keygen pubkey 2>/dev/null)" ]; then
  echo "There was a problem validating your keyfile. Restoring"
  cp ~/.config/solana/${OLD_WALLET}.json $OLD_PATH
fi

