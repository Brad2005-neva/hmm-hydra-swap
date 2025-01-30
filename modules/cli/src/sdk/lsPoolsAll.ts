import { createSDK } from "./utils";
import { LsPoolsArgs } from "./lsPools";
import { PoolInfo, PoolState, TokenAccount } from "@hydraprotocol/sdk";
import { PublicKey, AccountInfo } from "@solana/web3.js";

export type DetailedResult = PoolInfo & {
  poolState: PoolState;
  tokenXVault: AccountInfo<TokenAccount>;
  tokenYVault: AccountInfo<TokenAccount>;
  tokenXMint: PublicKey;
  tokenYMint: PublicKey;
};

export async function lsPoolsAll({
  network,
  walletLocation,
  start = 0,
  limit = 20,
}: LsPoolsArgs) {
  const sdk = createSDK(network, walletLocation);
  const result = await sdk.liquidityPools.getAllPoolsAsList(start, limit);

  const detailedResults: DetailedResult[] = [];
  for (const res of result) {
    const poolState = res.info;
    const tokenXVault = await sdk.accountLoaders
      .token(poolState.tokenXVault)
      .info();
    const tokenYVault = await sdk.accountLoaders
      .token(poolState.tokenYVault)
      .info();
    const tokenXMint = res.info.tokenXMint;
    const tokenYMint = res.info.tokenYMint;

    detailedResults.push({
      ...res,
      poolState,
      tokenXVault,
      tokenYVault,
      tokenXMint,
      tokenYMint,
    });
  }
  return detailedResults;
}
