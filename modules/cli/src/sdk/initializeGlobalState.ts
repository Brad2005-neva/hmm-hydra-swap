import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type InitializeGlobalStateArgs = DefaultArgs;

export async function initializeGlobalState({
  network,
  walletLocation,
}: InitializeGlobalStateArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.initializeGlobalState();
}

export async function initializeGlobalStateMultisig({
  network,
  walletLocation,
  multisigSafe,
  multisigActor,
}: InitializeGlobalStateArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.initializeGlobalStateTx();

  return await proposeMultisigTx(
    "initializeGlobalState",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
