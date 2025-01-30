import { PublicKey } from "@solana/web3.js";
import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type TransferGlobalAdminArgs = DefaultArgs & {
  admin: string;
};

export async function transferGlobalAdmin({
  network,
  walletLocation,
  admin,
}: TransferGlobalAdminArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.transferGlobalAdmin(new PublicKey(admin));
}

export async function transferGlobalAdminMultisig({
  network,
  walletLocation,
  admin,
  multisigSafe,
  multisigActor,
}: TransferGlobalAdminArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.transferGlobalAdminTx(new PublicKey(admin));

  return await proposeMultisigTx(
    "transferGlobalAdmin",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
