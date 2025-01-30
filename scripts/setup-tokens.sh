#!/usr/bin/env bash

set -e
set -x

NETWORK=$1
export DEBUG=1

if [[ -z "$NETWORK" ]]; then 
  echo "Network is not provided."
fi

USDT_AMT=10000000000
BTC_AMT=10000000000
ETH_AMT=10000000000

if [[ "$NETWORK" == "localnet" ]]; then
  solana config set --url http://localhost:8899
  solana airdrop 2

  spl-token create-token \
    keys/tokens/usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f.json \
    --decimals 6
  spl-token create-account usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f
  spl-token mint usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f $USDT_AMT

  spl-token create-token \
    keys/tokens/btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus.json \
    --decimals 8
  spl-token create-account btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus
  spl-token mint btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus $BTC_AMT

  spl-token create-token \
    keys/tokens/ethrDqpYCmfySxG6siow67fRcpxHiE8nnNSQrhQkHNS.json \
    --decimals 9
  spl-token create-account ethrDqpYCmfySxG6siow67fRcpxHiE8nnNSQrhQkHNS
  spl-token mint ethrDqpYCmfySxG6siow67fRcpxHiE8nnNSQrhQkHNS $ETH_AMT
fi

if [[ "$NETWORK" == "devnet" ]]; then
  yarn -s hydra faucet init --network $NETWORK -q --tokenDecimal 6 | xargs yarn update-token-key --network devnet --token USDC --address
  sleep 5
  yarn -s hydra faucet init --network $NETWORK -q --tokenDecimal 8 | xargs yarn update-token-key --network devnet --token wBTC --address
  sleep 5
  yarn -s hydra faucet init --network $NETWORK -q --tokenDecimal 9 | xargs yarn update-token-key --network devnet --token wETH --address
  
  USDT=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[0].address")
  BTC=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[1].address")
  ETH=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[2].address")
  SOL=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[3].address")

  yarn -s hydra faucet mint --network $NETWORK --tokenMint $USDT --amount $USDT_AMT --recipient $(solana address)
  sleep 5
  yarn -s hydra faucet mint --network $NETWORK --tokenMint $BTC --amount $BTC_AMT --recipient $(solana address)
  sleep 5
  yarn -s hydra faucet mint --network $NETWORK --tokenMint $ETH --amount $ETH_AMT --recipient $(solana address)
  sleep 5
fi



