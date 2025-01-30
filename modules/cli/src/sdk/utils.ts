import { HydraSDK, Network } from "@hydraprotocol/sdk";
import { HydraFaucetSDK } from "@hydraprotocol/sdk";
import NetworkMap from "@hydraprotocol/config/network-map.json";
import expandTilde from "expand-tilde";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import fs from "fs";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { SnowflakeSafe } from "@snowflake-so/safe-sdk";
import { AnchorProvider } from "@project-serum/anchor";
export function networkFrom(network: string): Network {
  return network as Network;
}

export function createSfSafe(provider: AnchorProvider) {
  return new SnowflakeSafe(provider);
}

export async function proposeMultisigTx(
  name: string,
  sdK: HydraSDK,
  transaction: Transaction,
  safeAddress: PublicKey
) {
  const safe = createSfSafe(sdK.ctx.provider);
  return await safe.createProposal(safeAddress, name, transaction.instructions);
}

export function ensurePublicKey(address?: string): PublicKey {
  if (!address)
    throw new Error("Snowflake address not given for snowflake proposal.");

  return new PublicKey(address);
}

export function createWallet(walletLocation: string) {
  const rawdata = fs.readFileSync(expandTilde(walletLocation));
  const keydata = JSON.parse(rawdata.toString());
  const keypair = Keypair.fromSecretKey(new Uint8Array(keydata));
  return new NodeWallet(keypair);
}

export function createSDK(
  networkName: string,
  walletLocation: string
): HydraSDK {
  const network = networkFrom(networkName);
  return HydraSDK.create(
    network,
    NetworkMap[network],
    createWallet(walletLocation)
  );
}

export function createFaucetSDK(networkName: string, walletLocation: string) {
  const network = networkFrom(networkName);
  if (!["devnet", "localnet"].includes(network)) {
    throw new Error(
      "Network must be devnet or localnet to access the faucet CLI"
    );
  }
  return HydraFaucetSDK.create(
    network,
    NetworkMap[network],
    createWallet(walletLocation)
  );
}

export function optionalBigInt(value: bigint | number | undefined) {
  if (typeof value === "undefined") return value;
  return BigInt(value);
}

export function optionalPublicKey(value: string | undefined) {
  if (typeof value === "undefined") return value;
  return new PublicKey(value);
}
