# Adding Liquidity

Call an RPC instruction to add liquidity to a given pool
Caller should ensure that the relative amounts of TokenX and TokenY hold the equivalent value.

## Props

| Name                | Type      | Description                                             |
| ------------------- | --------- | ------------------------------------------------------- |
| tokenXMint          | PublicKey | TokenX Mint public key                                  |
| tokenYMint          | PublicKey | TokenY Mint public key                                  |
| poolId              | Number    | Pool ID                                                 |
| tokenXAmount        | bigint    | Amount of token X tokens to provide                     |
| tokenYAmount        | bigint    | Amount of token Y tokens to provide                     |
| slippage (optional) | bigint    | slippage amount of acceptable slippage in basis points. |

## Example

```
const tx = await sdk.liquidityPools.addLiquidity(
    usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f,
    btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus,
    0,
    100000000000n,
    45166800000000n,
    100n
  );
```
