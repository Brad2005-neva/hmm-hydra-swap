import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type SetLimitsArgs = DefaultArgs & {
  poolId: number;
  enabled: boolean;
  liquidityTokenXMax: number;
  liquidityTokenYMax: number;
  swapTokenXMax: number;
  swapTokenYMax: number;
};

export async function setLimits({
  network,
  walletLocation,
  poolId,
  enabled,
  liquidityTokenXMax,
  liquidityTokenYMax,
  swapTokenXMax,
  swapTokenYMax,
}: SetLimitsArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.setLimits(poolId, {
    enabled: enabled,
    liquidityTokenXMax: BigInt(liquidityTokenXMax),
    liquidityTokenYMax: BigInt(liquidityTokenYMax),
    swapTokenXMax: BigInt(swapTokenXMax),
    swapTokenYMax: BigInt(swapTokenYMax),
  });
}

export async function setLimitsMultisig({
  network,
  walletLocation,
  poolId,
  enabled,
  liquidityTokenXMax,
  liquidityTokenYMax,
  swapTokenXMax,
  swapTokenYMax,
  multisigSafe,
  multisigActor,
}: SetLimitsArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk.as(multisigActor).liquidityPools.setLimitsTx(poolId, {
    enabled: enabled,
    liquidityTokenXMax: BigInt(liquidityTokenXMax),
    liquidityTokenYMax: BigInt(liquidityTokenYMax),
    swapTokenXMax: BigInt(swapTokenXMax),
    swapTokenYMax: BigInt(swapTokenYMax),
  });
  return await proposeMultisigTx(
    "setLimits",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
