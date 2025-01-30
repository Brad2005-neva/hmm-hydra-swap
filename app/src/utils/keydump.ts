import { HydraSDK, KeyFinder } from "@hydraprotocol/sdk";

export async function keydump(sdk: HydraSDK) {
  const poolInfo = await sdk.liquidityPools.getAllPoolsAsList();
  const dumps = await Promise.all(
    poolInfo.map((p) => {
      return KeyFinder.fromCtx(
        sdk.ctx,
        p.info.poolId,
        p.info.tokenXMint,
        p.info.tokenYMint
      ).dump();
    })
  );
  const dumplines = dumps.map(({ poolId, ...p }) => {
    return Object.entries(p)
      .map((k) => `${poolId}:${k.join(":")}`)
      .join("\n");
  });

  dumplines.map((line) => console.log(line));
}
