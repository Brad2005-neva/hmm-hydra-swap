import { PublicKey } from "@solana/web3.js";
import {
  createSDK,
  ensurePublicKey,
  optionalPublicKey,
  proposeMultisigTx,
} from "./utils";
import { DefaultArgs } from "./types";
import { PoolFeeType } from "@hydraprotocol/sdk";
export function isValidFeeType(value: string): value is PoolFeeType {
  return ["Percent", "VolatilityAdjusted"].includes(value);
}
export type InitializePoolStateArgs = DefaultArgs & {
  feeCalculation: string;
  feeLastUpdate: number;
  feeLastPrice: number;
  feeEwmaWindow: number;
  feeLastEwma: number;
  feeLambda: number;
  feeVelocity: number;
  feeMinPct: number;
  feeMaxPct: number;
  tokenXMint: string;
  tokenYMint: string;
  cValue: number;
  priceAccountX?: string;
  priceAccountY?: string;
};

export async function initializePoolState({
  feeCalculation,
  feeLastUpdate,
  feeLastPrice,
  feeEwmaWindow,
  feeLastEwma,
  feeLambda,
  feeVelocity,
  feeMinPct,
  feeMaxPct,
  tokenXMint,
  tokenYMint,
  cValue,
  priceAccountX,
  priceAccountY,
  network,
  walletLocation,
}: InitializePoolStateArgs) {
  const sdk = createSDK(network, walletLocation);
  if (!isValidFeeType(feeCalculation)) {
    throw new Error(
      'Bad feeCalculation type. Must be either "Percent" or "VolatilityAdjusted"'
    );
  }
  const poolFees = {
    feeCalculation,
    feeLastUpdate: BigInt(feeLastUpdate),
    feeLastPrice: BigInt(feeLastPrice),
    feeEwmaWindow: BigInt(feeEwmaWindow),
    feeLastEwma: BigInt(feeLastEwma),
    feeLambda: BigInt(feeLambda),
    feeVelocity: BigInt(feeVelocity),
    feeMinPct: BigInt(feeMinPct),
    feeMaxPct: BigInt(feeMaxPct),
  };
  return await sdk.liquidityPools.initializePoolState(
    new PublicKey(tokenXMint),
    new PublicKey(tokenYMint),
    poolFees,
    cValue,
    optionalPublicKey(priceAccountX),
    optionalPublicKey(priceAccountY)
  );
}

export async function initializePoolStateMultisig({
  feeCalculation,
  feeLastUpdate,
  feeLastPrice,
  feeEwmaWindow,
  feeLastEwma,
  feeLambda,
  feeVelocity,
  feeMinPct,
  feeMaxPct,
  tokenXMint,
  tokenYMint,
  cValue,
  priceAccountX,
  priceAccountY,
  network,
  walletLocation,
  multisigSafe,
  multisigActor,
}: InitializePoolStateArgs) {
  const sdk = createSDK(network, walletLocation);
  if (!isValidFeeType(feeCalculation)) {
    throw new Error(
      'Bad feeCalculation type. Must be either "Percent" or "VolatilityAdjusted"'
    );
  }
  const poolFees = {
    feeCalculation,
    feeLastUpdate: BigInt(feeLastUpdate),
    feeLastPrice: BigInt(feeLastPrice),
    feeEwmaWindow: BigInt(feeEwmaWindow),
    feeLastEwma: BigInt(feeLastEwma),
    feeLambda: BigInt(feeLambda),
    feeVelocity: BigInt(feeVelocity),
    feeMinPct: BigInt(feeMinPct),
    feeMaxPct: BigInt(feeMaxPct),
  };
  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.initializePoolStateTx(
      new PublicKey(tokenXMint),
      new PublicKey(tokenYMint),
      poolFees,
      cValue,
      optionalPublicKey(priceAccountX),
      optionalPublicKey(priceAccountY)
    );

  return await proposeMultisigTx(
    "initializePoolState",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
