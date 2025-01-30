import { useToken } from "./useToken";
import { useCallback, useMemo, useState } from "react";
import { Asset, getTokenList } from "@hydraprotocol/sdk";
import { useNetworkProvider } from "@hydraprotocol/services";
import { TokenSelectionService } from "../services/tokenSelection";

export function useSlippage() {
  const [slippage, setSlippage] = useState(50n); // 1.0% / 10000 basis points
  return { slippage, setSlippage };
}

function findAsset(assets: Asset[], address?: string) {
  return address
    ? assets.find((asset) => address === asset.address)
    : undefined;
}

function excludeAsset(assets: Asset[], address?: string) {
  return assets.filter((asset) => asset.address !== address);
}

export function useTokenForm(
  props?: {
    tokenAInit?: string;
    tokenBInit?: string;
  },
  tokenSelectionService = TokenSelectionService.getInstance()
) {
  const storedTokens = {
    tokenAInit: tokenSelectionService.getTokenA(),
    tokenBInit: tokenSelectionService.getTokenB(),
  };

  const { tokenAInit, tokenBInit } = props ?? storedTokens;
  const { network } = useNetworkProvider();
  const assets = getTokenList(network);

  const tokenA = useToken(findAsset(assets, tokenAInit), (asset) => {
    tokenSelectionService.setTokenA(asset.address);
  });
  const tokenB = useToken(findAsset(assets, tokenBInit), (asset) => {
    tokenSelectionService.setTokenB(asset.address);
  });

  const [focus, setFocus] = useState<"from" | "to">("from");

  const assetsTokenA = useMemo(
    () => excludeAsset(assets, tokenB?.asset?.address),
    [tokenB, assets]
  );

  const assetsTokenB = useMemo(
    () => excludeAsset(assets, tokenA?.asset?.address),
    [tokenA, assets]
  );

  // toggle fields
  const toggleFields = useCallback(() => {
    const bottomAsset = tokenB.asset;
    const topAsset = tokenA.asset;

    topAsset && tokenB.setAsset(topAsset);
    bottomAsset && tokenA.setAsset(bottomAsset);
  }, [tokenB, tokenA]);

  return {
    focus,
    setFocus,
    tokenA,
    tokenB,
    assetsTokenA,
    assetsTokenB,
    toggleFields,
  };
}
