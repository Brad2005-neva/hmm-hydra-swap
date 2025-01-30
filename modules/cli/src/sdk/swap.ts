import { PublicKey } from "@solana/web3.js";
import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type SwapArgs = DefaultArgs & {
  tokenXMint: string;
  tokenYMint: string;
  poolId: number;
  userFromToken: string;
  userToToken: string;
  amountIn: number;
  minimumAmountOut: number;
};

export async function swap({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  userFromToken,
  userToToken,
  minimumAmountOut,
  amountIn,
}: SwapArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.swap(
    new PublicKey(tokenXMint),
    new PublicKey(tokenYMint),
    poolId,
    new PublicKey(userFromToken),
    new PublicKey(userToToken),
    BigInt(amountIn),
    BigInt(minimumAmountOut)
  );
}

export async function swapMultisig({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  userFromToken,
  userToToken,
  minimumAmountOut,
  amountIn,
  multisigSafe,
  multisigActor,
}: SwapArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.swapTx(
      new PublicKey(tokenXMint),
      new PublicKey(tokenYMint),
      poolId,
      new PublicKey(userFromToken),
      new PublicKey(userToToken),
      BigInt(amountIn),
      BigInt(minimumAmountOut)
    );

  return await proposeMultisigTx(
    "swap",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
