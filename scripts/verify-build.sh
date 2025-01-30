#!/usr/bin/env bash

echo "Verify build"

yarn build --filter=@hydraprotocol/core --no-cache --force

HYDRA_LIQUIDITY_POOLS=$(solana address --keypair ./modules/core/target/deploy/hydra_liquidity_pools-keypair.json)

echo "Verifying against program_id $HYDRA_LIQUIDITY_POOLS"

./scripts/validate-remote.sh mainnet-beta $HYDRA_LIQUIDITY_POOLS ./modules/core/target/deploy/hydra_liquidity_pools.so