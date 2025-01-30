import { AssetPair, PoolDescriptor, AssetMap } from "../types";

const DISPLAY_ORDER = [
  // testing
  "USDC:wBTC",
  "USDC:wETH",
  "USDC:wSOL",
  "wBTC:wETH",
  "wBTC:wSOL",
  "wETH:wSOL",

  // mainnet
  "USDC:BTC",
  "USDC:ETH",
  "USDC:SOL",
  "BTC:ETH",
  "BTC:SOL",
  "ETH:SOL",
];

export function getAssetsFromPoolDescriptor(
  poolDescriptor: PoolDescriptor,
  assetMap: AssetMap
) {
  const { tokenXMint, tokenYMint } = poolDescriptor;

  const tokenXAsset = assetMap.get(`${tokenXMint}`);
  const tokenYAsset = assetMap.get(`${tokenYMint}`);

  if (!tokenXAsset || !tokenYAsset) return [undefined, undefined] as const;
  return orderAssetPairForDisplay([tokenXAsset, tokenYAsset]);
}
export function orderAssetPairForDisplay(pair: AssetPair): AssetPair {
  const symbolPair = pair.map((p) => p.symbol);

  if (DISPLAY_ORDER.includes(symbolPair.join(":"))) {
    return pair;
  }

  if (DISPLAY_ORDER.includes([...symbolPair].reverse().join(":"))) {
    return [...pair].reverse() as AssetPair;
  }

  throw new Error("Not found in ordering table: " + symbolPair);
}
