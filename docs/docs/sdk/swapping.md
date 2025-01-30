# Swapping

Call an RPC instruction to swap tokens with a pool.

## Props

| Name             | Type                       | Description                                                                                |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| tokenXMint       | PublicKey                  | TokenX Mint public key                                                                     |
| tokenYMint       | PublicKey                  | TokenY Mint public key                                                                     |
| poolId           | Number                     | Pool ID                                                                                    |
| userFromToken    | bigint                     | The user's own associated token account for the token the user is depositing to the pool.  |
| userToToken      | big.liquidityPools.swapint | The user's own associated token account for the token the user is recieving from the pool. |
| amountIn         | bigint                     | The number of tokens in the userFromToken account the user wishes to deposit.              |
| minimumAmountOut | bigint                     | The minimum number of tokens the user expects to receive in their userToToken account.     |

## Example

```
const tx = await sdk.liquidityPools.swap(
    usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f,
    btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus,
    0,
    usrKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f,
    usrYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus,
    1_000000n,
    37_000_000000n
  );
```
