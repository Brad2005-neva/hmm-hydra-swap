import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { parseEnabledDisabled } from "./utils/parseEnabledDisabled";
import { isFeatureType } from "./utils/isFeatureType";
import { DefaultArgs } from "./types";

// instructions

export type SetFeatureArgs = DefaultArgs & {
  disable?: boolean;
  enable?: boolean;
  type: string; // "swap|add-liquidity|remove-liquidity|create-pools|all"
};

export async function setFeature({
  network,
  walletLocation,
  enable,
  disable,
  type,
}: SetFeatureArgs) {
  const isActive = parseEnabledDisabled(enable, disable);
  if (!isFeatureType(type)) {
    throw new Error();
  }
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.setFeature(type, isActive);
}

export async function setFeatureMultisig({
  network,
  walletLocation,
  enable,
  disable,
  type,
  multisigSafe,
  multisigActor,
}: SetFeatureArgs) {
  const isActive = parseEnabledDisabled(enable, disable);
  if (!isFeatureType(type)) {
    throw new Error();
  }
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.setFeatureTx(type, isActive);

  return await proposeMultisigTx(
    "setFeature",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
