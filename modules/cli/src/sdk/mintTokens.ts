import { PublicKey } from "@solana/web3.js";
import { createFaucetSDK } from "./utils";
import { DefaultArgs, TxReturn } from "./types";
export type MintTokenArgs = DefaultArgs & {
  tokenMint: string;
  recipient: string;
  amount: number;
};

export async function mintTokens({
  network,
  walletLocation,
  tokenMint,
  recipient,
  amount,
}: MintTokenArgs): Promise<TxReturn> {
  const sdk = createFaucetSDK(network, walletLocation);
  const tx = await sdk.methods.mintTokens(
    new PublicKey(tokenMint),
    new PublicKey(recipient),
    BigInt(amount)
  );
  return { tx };
}
