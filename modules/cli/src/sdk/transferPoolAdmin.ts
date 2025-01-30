import { PublicKey } from "@solana/web3.js";
import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { DefaultArgs } from "./types";

export type TransferPoolAdminArgs = DefaultArgs & {
  admin: string;
  poolId: number;
};

export async function transferPoolAdmin({
  network,
  walletLocation,
  admin,
  poolId,
}: TransferPoolAdminArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.transferPoolAdmin(
    poolId,
    new PublicKey(admin)
  );
}

export async function transferPoolAdminMultisig({
  network,
  walletLocation,
  admin,
  poolId,
  multisigSafe,
  multisigActor,
}: TransferPoolAdminArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.transferPoolAdminTx(poolId, new PublicKey(admin));

  return await proposeMultisigTx(
    "transferPoolAdmin",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
