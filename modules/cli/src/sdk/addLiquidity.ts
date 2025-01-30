import { PublicKey } from "@solana/web3.js";
import { DefaultArgs } from "./types";
import {
  createSDK,
  ensurePublicKey,
  optionalBigInt,
  proposeMultisigTx,
} from "./utils";

export type AddLiquidityArgs = DefaultArgs & {
  tokenXMint: string;
  tokenYMint: string;
  poolId: number;
  tokenXAmount: number;
  tokenYAmount: number;
  slippage?: number;
};

export async function addLiquidity({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  tokenXAmount,
  tokenYAmount,
  slippage,
}: AddLiquidityArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk.liquidityPools.addLiquidity(
    new PublicKey(tokenXMint),
    new PublicKey(tokenYMint),
    poolId,
    BigInt(tokenXAmount),
    BigInt(tokenYAmount),
    optionalBigInt(slippage)
  );
  return tx;
}

export async function addLiquidityMultisig({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  tokenXAmount,
  tokenYAmount,
  slippage,
  multisigSafe,
  multisigActor,
}: AddLiquidityArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.addLiquidityTx(
      new PublicKey(tokenXMint),
      new PublicKey(tokenYMint),
      poolId,
      BigInt(tokenXAmount),
      BigInt(tokenYAmount),
      optionalBigInt(slippage)
    );

  return await proposeMultisigTx(
    "addLiquidity",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
