# Removing Liquidity

Call an RPC instruction to remove Liquidity from the pool.

## Props

| Name           | Type      | Description                                    |
| -------------- | --------- | ---------------------------------------------- |
| tokenXMint     | PublicKey | TokenX Mint public key                         |
| tokenYMint     | PublicKey | TokenY Mint public key                         |
| poolId         | Number    | Pool ID                                        |
| lpTokensToBurn | bigint    | Number of liquidity provider tokens to deposit |

## Example

```
const tx = await sdk.liquidityPools.removeLiquidity(
    usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f,
    btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus,
    0,
    360437607n
  );
```
