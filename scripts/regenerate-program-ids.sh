#!/bin/sh

# generate new keypairs
solana-keygen new --no-bip39-passphrase -s --force -o keys/programs/hydra_benchmarks-keypair.json
solana-keygen new --no-bip39-passphrase -s --force -o keys/programs/hydra_faucet-keypair.json
solana-keygen new --no-bip39-passphrase -s --force -o keys/programs/hydra_liquidity_pools-keypair.json

# save ids
export HYDRA_BENCHMARKS=$(solana address --keypair ./keys/programs/hydra_benchmarks-keypair.json)
export HYDRA_FAUCET=$(solana address --keypair ./keys/programs/hydra_faucet-keypair.json)
export HYDRA_LIQUIDITY_POOLS=$(solana address --keypair ./keys/programs/hydra_liquidity_pools-keypair.json)

# output ids
echo "HYDRA_BENCHMARKS=$HYDRA_BENCHMARKS"
echo "HYDRA_FAUCET=$HYDRA_FAUCET"
echo "HYDRA_LIQUIDITY_POOLS=$HYDRA_LIQUIDITY_POOLS"

# Search and replace for ids in folders
find ./modules/core/programs/hydra-benchmarks/ -type f -exec sed -i -e "s/\(declare_id!(\"\)\([^\"]\+\)/\1$HYDRA_BENCHMARKS/g" {} \;
find ./modules/core/programs/hydra-faucet/ -type f -exec sed -i -e "s/\(declare_id!(\"\)\([^\"]\+\)/\1$HYDRA_FAUCET/g" {} \;
find ./modules/core/programs/hydra-liquidity-pools/ -type f -exec sed -i -e "s/\(declare_id!(\"\)\([^\"]\+\)/\1$HYDRA_LIQUIDITY_POOLS/g" {} \;

# replace within global config
# probably a better way to do this
jq "((.devnet,.testnet,.localnet).programIds.hydraBenchmarks=env.HYDRA_BENCHMARKS)
|((.devnet,.testnet,.localnet).programIds.hydraFaucet=env.HYDRA_FAUCET)
|((.devnet,.testnet,.localnet).programIds.hydraLiquidityPools=env.HYDRA_LIQUIDITY_POOLS)" modules/config/global-config.json > /tmp/global-config.json && cat /tmp/global-config.json > modules/config/global-config.json