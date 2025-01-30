#!/bin/bash

# An example script for testing the cli

export DEBUG=1

yarn val clean
yarn val -d

solana config set --url http://localhost:8899

spl-token create-token --decimals 8 keys/tokens/btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus.json
spl-token create-token --decimals 6 keys/tokens/usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f.json

export TOKEN_X_MINT=btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus
export TOKEN_Y_MINT=usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f
export TOKEN_X_ATA=$(spl-token create-account $TOKEN_X_MINT | grep account | awk '{print $3}')
export TOKEN_Y_ATA=$(spl-token create-account $TOKEN_Y_MINT | grep account | awk '{print $3}')

echo "TOKEN_X_MINT:$TOKEN_X_MINT"
echo "TOKEN_Y_MINT:$TOKEN_Y_MINT"
echo "TOKEN_X_ATA:$TOKEN_X_ATA"
echo "TOKEN_Y_ATA:$TOKEN_Y_ATA"

spl-token mint $TOKEN_X_MINT 1000000
spl-token mint $TOKEN_Y_MINT 10000000000

yarn hydra lp initialize-global-state
yarn hydra lp initialize --tokenXMint $TOKEN_X_MINT --tokenYMint $TOKEN_Y_MINT

yarn hydra lp add-liquidity \
  --poolId 0 \
  --tokenXMint $TOKEN_X_MINT \
  --tokenYMint $TOKEN_Y_MINT \
  --tokenXAmount 100000000000 \
  --tokenYAmount 45166800000000

yarn hydra lp swap \
  --poolId 0 \
  --tokenXMint $TOKEN_X_MINT \
  --tokenYMint $TOKEN_Y_MINT \
  --userFromToken $TOKEN_X_ATA \
  --userToToken $TOKEN_Y_ATA \
  --amountIn 200000000 \
  --minimumAmountOut 89900000000
