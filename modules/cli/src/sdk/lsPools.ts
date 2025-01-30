import { PoolInfo } from "@hydraprotocol/sdk";
import { DefaultArgs } from "./types";
import { createSDK } from "./utils";
export type LsPoolsArgs = DefaultArgs & {
  start?: number;
  limit?: number;
  all?: boolean;
};

export async function lsPools({
  network,
  walletLocation,
  start = 0,
  limit = 20,
}: LsPoolsArgs): Promise<PoolInfo[]> {
  const sdk = createSDK(network, walletLocation);
  return await sdk.liquidityPools.getAllPoolsAsList(start, limit);
}
