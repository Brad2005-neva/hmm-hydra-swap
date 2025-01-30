import { Asset } from "@hydraprotocol/sdk";
import {
  getAssetsFromPoolDescriptor,
  PoolDescriptor,
  AssetMap,
} from "@hydraprotocol/services";

export type PoolWithTokenAssets = {
  tokenAInit: Asset;
  tokenBInit: Asset;
  poolDescriptor: PoolDescriptor;
};

export function prepareViewModel(
  assetMap: AssetMap,
  pools: PoolDescriptor[]
): PoolWithTokenAssets[] {
  const poolsWithAssets: PoolWithTokenAssets[] = [];
  for (const poolDescriptor of pools) {
    const [tokenAInit, tokenBInit] = getAssetsFromPoolDescriptor(
      poolDescriptor,
      assetMap
    );

    if (tokenAInit && tokenBInit)
      poolsWithAssets.push({
        tokenAInit,
        tokenBInit,
        poolDescriptor,
      });
  }
  return poolsWithAssets;
}
