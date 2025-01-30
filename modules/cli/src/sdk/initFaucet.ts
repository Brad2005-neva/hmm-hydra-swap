import { Keypair } from "@solana/web3.js";
import { createFaucetSDK } from "./utils";
import { DefaultArgs, TxReturn } from "./types";

export type InitFaucetArgs = DefaultArgs & {
  tokenDecimal: number;
  quiet: boolean;
};

export async function initFaucet({
  network,
  walletLocation,
  tokenDecimal,
}: InitFaucetArgs): Promise<TxReturn & { key: string }> {
  const sdk = createFaucetSDK(network, walletLocation);
  const keypair = Keypair.generate();
  const tx = await sdk.methods.initFaucet(tokenDecimal, keypair);
  return { tx, key: `${keypair.publicKey}` };
}
