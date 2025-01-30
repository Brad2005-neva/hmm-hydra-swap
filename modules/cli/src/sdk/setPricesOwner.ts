import { PublicKey } from "@solana/web3.js";
import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type SetPricesOwnerArgs = DefaultArgs & {
  owner: string;
};

export async function setPricesOwner({
  network,
  walletLocation,
  owner,
}: SetPricesOwnerArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.setPricesOwner(new PublicKey(owner));
}

export async function setPricesOwnerMultisig({
  network,
  walletLocation,
  owner,
  multisigSafe,
  multisigActor,
}: SetPricesOwnerArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.setPricesOwnerTx(new PublicKey(owner));

  return await proposeMultisigTx(
    "setPricesOwner",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
