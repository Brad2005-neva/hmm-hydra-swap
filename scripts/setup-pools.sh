#!/usr/bin/env bash

set -e
set -x


## BEFORE RUNNING THIS SCRIPT YOU WILL WANT TO UPDATE PRICES FROM HERE (2 decimal places)
## https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]
## The following sets up values based on given prices:

BTC_USD_PRICE_AMT=19095.66
SOL_USD_PRICE_AMT=29.76
ETH_USD_PRICE_AMT=1277.92
USD_USD_PRICE_AMT=1
BTC_DECIMALS=8
SOL_DECIMALS=9
ETH_DECIMALS=9
USD_DECIMALS=6

# Before running this script you will want to have tokens available 
# via the token faucet that have been saved to your target clusters 
# config in /modules/config/tokens.json as well as having your
# programs deployed on said cluster

NETWORK=$1
if [[ -z "$NETWORK" ]]; then
  echo "No network provided! "
  exit 1
fi

# Breaks for waiting between ixs (needs to be slower on live networks)
if [[ "$NETWORK" == "localnet" ]]; then
  SHORT_BREAK=5
  LONG_BREAK=10
else
  SHORT_BREAK=10
  LONG_BREAK=30
fi

export DEBUG=1
USDT=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[0].address")
BTC=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[1].address")
ETH=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[2].address")
SOL=$(cat ./modules/config/tokens.json | jq -r ".$NETWORK[3].address")


# prices from pyth devnet 
PYTH_OWNER=gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s
BTC_USD_PRICE=HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J
ETH_USD_PRICE=EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw
SOL_USD_PRICE=J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix
USDT_USD_PRICE=38xoQ4oeJCBrcVvca2cGk7iV1dAfrmTR1kmhSCJQ8Jto

## UNCOMMENT OUT THE FOLLOWING FOR A FRESH INSTALL
yarn hydra lp initialize-global-state --network $NETWORK
sleep $SHORT_BREAK
yarn hydra lp set-prices-owner --network $NETWORK --owner $PYTH_OWNER
sleep $SHORT_BREAK



echo "1. USDT,BTC"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $BTC 
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $USD_DECIMALS \
  --tokenXPrice $USD_USD_PRICE_AMT \
  --tokenYDecimals $BTC_DECIMALS \
  --tokenYPrice $BTC_USD_PRICE_AMT \
  --scale 10000000)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $BTC \
  --poolId 0 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK

echo "2. USDT,ETH"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $ETH \
  --feeCalculation VolatilityAdjusted \
  --feeMinPct 500000000 \
  --feeMaxPct 20000000000 \
  --feeEwmaWindow 3600000000000000 \
  --feeLambda 545000000000 \
  --feeVelocity 4166666666
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $USD_DECIMALS \
  --tokenXPrice $USD_USD_PRICE_AMT \
  --tokenYDecimals $ETH_DECIMALS \
  --tokenYPrice $ETH_USD_PRICE_AMT \
  --scale 10000000)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $ETH \
  --poolId 1 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK

echo "3. USDT,SOL"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $SOL
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $USD_DECIMALS \
  --tokenXPrice $USD_USD_PRICE_AMT \
  --tokenYDecimals $SOL_DECIMALS \
  --tokenYPrice $SOL_USD_PRICE_AMT \
  --scale 40)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $USDT \
  --tokenYMint $SOL \
  --poolId 2 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK

echo "4. BTC,ETH"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $BTC \
  --tokenYMint $ETH \
  --priceAccountX $BTC_USD_PRICE \
  --priceAccountY $ETH_USD_PRICE \
  --cValue 150
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $BTC_DECIMALS \
  --tokenXPrice $BTC_USD_PRICE_AMT \
  --tokenYDecimals $ETH_DECIMALS \
  --tokenYPrice $ETH_USD_PRICE_AMT \
  --scale 1000)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $BTC \
  --tokenYMint $ETH \
  --poolId 3 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK

echo "5. BTC,SOL"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $BTC \
  --tokenYMint $SOL \
  --priceAccountX $BTC_USD_PRICE \
  --priceAccountY $SOL_USD_PRICE \
  --cValue 125
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $BTC_DECIMALS \
  --tokenXPrice $BTC_USD_PRICE_AMT \
  --tokenYDecimals $SOL_DECIMALS \
  --tokenYPrice $SOL_USD_PRICE_AMT \
  --scale 0.002)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $BTC \
  --tokenYMint $SOL \
  --poolId 4 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK

echo "6. ETH,SOL"
yarn hydra lp initialize-pool-state --network $NETWORK \
  --tokenXMint $ETH \
  --tokenYMint $SOL \
  --priceAccountX $ETH_USD_PRICE \
  --priceAccountY $SOL_USD_PRICE \
  --cValue 100
sleep $LONG_BREAK

# ADD LIQUIDITY
POOL_PRICE_INFO=$(yarn -s ts-node scripts/calculate-pool-amount.ts \
  --tokenXDecimals $ETH_DECIMALS \
  --tokenXPrice $ETH_USD_PRICE_AMT \
  --tokenYDecimals $SOL_DECIMALS \
  --tokenYPrice $SOL_USD_PRICE_AMT \
  --scale 0.02)
XAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.x')
YAMOUNT=$(echo $POOL_PRICE_INFO | jq -r '.y')
yarn hydra lp add-liquidity --network $NETWORK \
  --tokenXMint $ETH \
  --tokenYMint $SOL \
  --poolId 5 \
  --tokenXAmount $XAMOUNT \
  --tokenYAmount $YAMOUNT
sleep $LONG_BREAK
