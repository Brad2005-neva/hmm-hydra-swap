import { PublicKey } from "@solana/web3.js";

export type GlobalState = {
  admin: PublicKey;
  pricesOwner: PublicKey;
  poolCount: number;
  globalStateBump: number;
  swapDisabled: boolean;
  addLiquidityDisabled: boolean;
  removeLiquidityDisabled: boolean;
  createPublicPoolsDisabled: boolean;
};

export enum FeatureType {
  Swap = "swap",
  AddLiquidity = "add-liquidity",
  RemoveLiquidity = "remove-liquidity",
  CreatePublicPools = "create-public-pool",
  All = "all",
}

export type Prices = {
  priceAccountX: PublicKey;
  priceAccountY: PublicKey;
};

export type Limits = {
  enabled: boolean;
  liquidityTokenXMax: bigint;
  liquidityTokenYMax: bigint;
  swapTokenXMax: bigint;
  swapTokenYMax: bigint;
};

export type PoolState = {
  admin: PublicKey;
  tokenXVault: PublicKey;
  tokenYVault: PublicKey;
  tokenXMint: PublicKey;
  tokenYMint: PublicKey;
  lpTokenMint: PublicKey;
  poolId: number;
  poolStateBump: number;
  tokenXVaultBump: number;
  tokenYVaultBump: number;
  lpTokenVaultBump: number;
  cValue: number;
  fees: PoolFees;
  prices: Prices;
  limits: Limits;
};
export type PoolFeeType = "Percent" | "VolatilityAdjusted";
export type PoolFees = {
  feeCalculation: PoolFeeType;
  feeLastUpdate: bigint;
  feeLastPrice: bigint;
  feeEwmaWindow: bigint;
  feeLastEwma: bigint;
  feeLambda: bigint;
  feeVelocity: bigint;
  feeMinPct: bigint;
  feeMaxPct: bigint;
};
export type OptionalPoolFees = {
  feeCalculation: PoolFeeType;
  feeLastUpdate?: bigint;
  feeLastPrice?: bigint;
  feeEwmaWindow?: bigint;
  feeLastEwma?: bigint;
  feeLambda?: bigint;
  feeVelocity?: bigint;
  feeMinPct?: bigint;
  feeMaxPct?: bigint;
};
export type PoolFeesJson = {
  feeCalculation: string;
  feeLastUpdate: number;
  feeLastPrice: number;
  feeEwmaWindow: number;
  feeLastEwma: number;
  feeLambda: number;
  feeVelocity: number;
  feeMinPct: number;
  feeMaxPct: number;
};
export function parseJsonFees(obj: PoolFeesJson): PoolFees {
  return {
    feeCalculation: obj.feeCalculation as PoolFeeType,
    feeEwmaWindow: BigInt(obj.feeEwmaWindow),
    feeLambda: BigInt(obj.feeLambda),
    feeLastEwma: BigInt(obj.feeLastEwma),
    feeLastPrice: BigInt(obj.feeLastPrice),
    feeLastUpdate: BigInt(obj.feeLastUpdate),
    feeMaxPct: BigInt(obj.feeMaxPct),
    feeMinPct: BigInt(obj.feeMinPct),
    feeVelocity: BigInt(obj.feeVelocity),
  };
}

export type TokenPrices = Record<string, number> | undefined;

export type Log = (...strOrObjArr: Array<Record<string, any> | string>) => void;
