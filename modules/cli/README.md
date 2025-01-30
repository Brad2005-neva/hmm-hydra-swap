# Using the cli

### Run a clean validator

```
yarn val clean
yarn val -d
```

### Setup your wallet

In a second Terminal run the following:

```bash
solana config set --url http://localhost:8899
```

### Setup some tokens

Create 2 sorted token mints and relevant associated accounts and save them to env vars:

```bash
# Create tokens
spl-token create-token --decimals 8 keys/tokens/btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus.json
spl-token create-token --decimals 6 keys/tokens/usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f.json

# NOTE: MINTS MUST BE SORTED BY BUFFER ORDER! (X < Y)
export TOKEN_X_MINT=btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus
export TOKEN_Y_MINT=usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f

# Work out our ATAs
export TOKEN_X_ATA=$(spl-token create-account $TOKEN_X_MINT | grep account | awk '{print $3}')
export TOKEN_Y_ATA=$(spl-token create-account $TOKEN_Y_MINT | grep account | awk '{print $3}')

# Print everything out
echo "TOKEN_X_MINT:$TOKEN_X_MINT"
echo "TOKEN_Y_MINT:$TOKEN_Y_MINT"
echo "TOKEN_X_ATA:$TOKEN_X_ATA"
echo "TOKEN_Y_ATA:$TOKEN_Y_ATA"
```

Check the balances of the tokens:

```
$ spl-token accounts
Token                                         Balance
---------------------------------------------------------------
btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus   0
usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f   0
```

Let's give ourselves some tokens:

```bash
$ spl-token mint $TOKEN_X_MINT 1000000
$ spl-token mint $TOKEN_Y_MINT 10000000000
```

Check the balances of the tokens:

```
$ spl-token accounts
Token                                         Balance
---------------------------------------------------------------
btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus   1000000
usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f   10000000000
```

### Setup liquidity pools

Let's initialize our global state:

```
$ yarn hydra lp initialize-global-state
tx : 3YS5QBH22m65R4xzuwa9UpjLzmcxy7EJFBtfg9JsWEaakaQRdi6C8hShTS1KwrrR15VYsFzvnG7J221X3Hyc71kc
```

Find pools:

```
$ yarn hydra lp ls
No pools found
```

Create a pool:

```
$ yarn hydra lp initialize --tokenXMint $TOKEN_X_MINT --tokenYMint $TOKEN_Y_MINT
tx : 4BhHrAkCqq1t2z4zqi4dNBKrxC67QYGncRqSZPUC8Ct8ov9s1Ff5yPPH5pcXizeXF6dv4idgM6CQwDdD1vCGygfV
```

List all pools:

```
$ yarn hydra lp ls
┌─────────┬─────┬────────────────────────────────────────────────┐
│ (index) │ id  │                      key                       │
├─────────┼─────┼────────────────────────────────────────────────┤
│    0    │ '0' │ 'D1Niz32jrUyHhesQ2mJCSG3HorWkL6gZBfLMxTy2Fn92' │
└─────────┴─────┴────────────────────────────────────────────────┘
```

### Add Liquidity

Add liquidity to the pool:

```
$ yarn hydra lp add-liquidity \
  --poolId 0 \
  --tokenXMint $TOKEN_X_MINT \
  --tokenYMint $TOKEN_Y_MINT \
  --tokenXAmount 100000000000 \
  --tokenYAmount 45166800000000

tx : 4BhHrAkCqq1t2z4zqi4dNBKrxC67QYGncRqSZPUC8Ct8ov9s1Ff5yPPH5pcXizeXF6dv4idgM6CQwDdD1vCGygfV
```

### Swap

Execute a swap:

```
$ yarn hydra lp swap \
  --poolId 0 \
  --tokenXMint $TOKEN_X_MINT \
  --tokenYMint $TOKEN_Y_MINT \
  --userFromToken $TOKEN_X_ATA \
  --userToToken $TOKEN_Y_ATA \
  --amountIn 200000000 \
  --minimumAmountOut 89900000000

tx : 6781yghja876t871tghjbg8790dsd232dws23tgVNNqbp9dsJarjPH9KDUTZ4p4FT7QtxF4jXPHnBFm5x7iesXze
```

### Limits

Add limits (constraints) to the pool:

```
$ yarn hydra lp set-limits \
    --poolId 0 \
    --enabled true \
    --addLiquidityAmountMax 1000000000 \
    --removeLiquidityAmountMax 10000000000 \
    --swapAmountInMax 1000000000 \
    --swapAmountOutMax 1000000000

tx : DiScaskTXczYM5BQnjfRwM3fYfX3CxCvfzf3ThVNNqbp9dsJarjPH9KDUTZ4p4FT7QtxF4jXPHnBFm5x7iesXze
```
