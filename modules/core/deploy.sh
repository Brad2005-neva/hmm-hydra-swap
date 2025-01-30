#!/usr/bin/env bash

CLUSTER=$1

declare -A CLUSTERS=( 
 ['devnet']=1  ["mainnet-beta"]=1  ["testnet"]=1 ["http://localhost:8899"]=1
)

if [[ -z "${CLUSTERS[$CLUSTER]}" ]]; then
  echo "invalid cluster specified $CLUSTER"
  exit 1
fi

echo "DETECTED CLUSTER:$CLUSTER"

# Default to deploy
if [[ -z "$2" ]]; then
  if [[ -z "$SOLANA_DEPLOY_KEY" ]]; then
    KEY=$(cat ~/.config/solana/id.json)
  else 
    KEY=$SOLANA_DEPLOY_KEY
  fi
else
  KEY=$2
fi

echo $KEY > /tmp/key.json

./prepare.sh

solana config set --url $CLUSTER
solana airdrop 2 -k /tmp/key.json || true

# deploy program copy this to add more to list
PROGRAM=hydra_liquidity_pools
echo "DEPLOYING:$PROGRAM"
solana program deploy ./target/deploy/$PROGRAM.so -k /tmp/key.json 
# end deploy program

# deploy program copy this to add more to list
PROGRAM=hydra_faucet
echo "DEPLOYING:$PROGRAM"
solana program deploy ./target/deploy/$PROGRAM.so -k /tmp/key.json 
# end deploy program

rm /tmp/key.json

echo "FINISHED"