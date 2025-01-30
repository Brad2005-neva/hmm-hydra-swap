# prepare for deployment

# copy contract keys to target if we are on devnet
mkdir -p ./target/deploy

echo "Preparing build/deploy keys. MAINNET=${MAINNET}"

echo "Copying keys from keys folder..."
cp ../../keys/programs/*.json ./target/deploy/

if [[ -n "$MAINNET" ]]; then
  echo "Setting up mainnet program id..."
  if [[ -z "$SOLANA_HYDRA_LIQUIDITY_POOLS_PROGRAM_ID_KEY" ]]; then 
    echo "Error: no 'SOLANA_HYDRA_LIQUIDITY_POOLS_PROGRAM_ID_KEY' env var set."
    exit 1
  fi
  echo $SOLANA_HYDRA_LIQUIDITY_POOLS_PROGRAM_ID_KEY > ./target/deploy/hydra_liquidity_pools-keypair.json
  export HYDRA_LIQUIDITY_POOLS=$(solana address --keypair ./target/deploy/hydra_liquidity_pools-keypair.json)
  echo "Replacing public keys in solana program code..."
  jq "((.devnet,.testnet,.[\"mainnet-beta\"],.localnet).programIds.hydraLiquidityPools=env.HYDRA_LIQUIDITY_POOLS)" ../config/global-config.json > /tmp/global-config.json && cat /tmp/global-config.json > ../config/global-config.json
  find ./programs/hydra-liquidity-pools/ -type f -exec sed -i -e "s/\(declare_id!(\"\)\([^\"]\+\)/\1$HYDRA_LIQUIDITY_POOLS/g" {} \;
fi
