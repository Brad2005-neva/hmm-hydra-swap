import { FC } from "react";

import { useAssets, useMyPools } from "@hydraprotocol/services";
import { TokenPrices } from "@types";
import { prepareViewModel } from "./prepareViewModel";
import { PoolList } from "./PoolList";

interface TabProps {
  tokenPrices: TokenPrices;
}

const LiquidityTab: FC<TabProps> = ({ tokenPrices }) => {
  const { keys: pools, loading } = useMyPools();
  const assetMap = useAssets();
  const filteredPools = prepareViewModel(assetMap, pools);
  return (
    <PoolList
      type="liquidity"
      tokenPrices={tokenPrices}
      pools={filteredPools}
      loading={loading}
      message="You have no liquidity at the moment."
    />
  );
};

export default LiquidityTab;
