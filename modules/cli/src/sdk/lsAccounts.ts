import { PublicKey } from "@solana/web3.js";
import { LsAccountArgs } from "./inspect";
import { createSDK } from "./utils";

export async function lsAccounts({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
}: LsAccountArgs) {
  const sdk = createSDK(network, walletLocation);

  const obj =
    tokenXMint && tokenYMint && typeof poolId !== "undefined"
      ? await sdk.liquidityPools.accounts.getAccountLoaders(
          new PublicKey(tokenXMint),
          new PublicKey(tokenYMint),
          poolId
        )
      : {
          globalState: sdk.liquidityPools.accounts.globalState(),
        };

  const out = Object.fromEntries(
    await Promise.all(
      Object.entries(obj).map(async ([name, loader]) => {
        return [name, await loader.key()];
      })
    )
  );
  console.log({ obj, out });
  return { result: out };
}
