import { LoaderFinder } from "@hydraprotocol/sdk";
import { createSDK } from "./utils";
import { DefaultArgs } from "./types";
import { InspectArgs } from "../cmds/liquidity-pools/inspect";

export type LsAccountArgs = DefaultArgs & {
  tokenXMint?: string;
  tokenYMint?: string;
  poolId?: number;
};
export async function inspect({
  network,
  walletLocation,
  poolId,
  data,
}: InspectArgs) {
  const sdk = createSDK(network, walletLocation);

  const finder = LoaderFinder.fromCtx(sdk.ctx);

  const loader =
    typeof poolId !== "undefined"
      ? finder.poolState(poolId)
      : finder.globalState();

  const info = await loader.info();
  return data ? info.data : info;
}
