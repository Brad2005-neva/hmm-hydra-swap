import { FC } from "react";
import { useAssets, usePools } from "@hydraprotocol/services";

import { TokenPrices } from "@types";
import { prepareViewModel } from "./prepareViewModel";
import { PoolList } from "./PoolList";

interface TabProps {
  tokenPrices: TokenPrices;
}

const PoolsTab: FC<TabProps> = ({ tokenPrices }) => {
  const { keys: pools, loading } = usePools();
  const assetMap = useAssets();
  const filteredPools = prepareViewModel(assetMap, pools);
  return (
    <PoolList
      type="all"
      tokenPrices={tokenPrices}
      pools={filteredPools}
      loading={loading}
    />
  );
};

export default PoolsTab;
