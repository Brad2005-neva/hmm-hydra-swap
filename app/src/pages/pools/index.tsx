import React, { useState, useCallback, useMemo } from "react";

import { useOraclePrices } from "@hydraprotocol/services";
import { Hydraswap } from "@ui/icons";
import HydraPage from "@ui/hydraPage";
import LoaderSpinner from "@ui/loaderSpinner";
import TabPageWrapper from "@ui/poolListing/tabPageWrapper";
import { Tabs, Tab } from "@ui/poolListing/tabs";
import TabContainer from "@ui/poolListing/tabContainer";
import PoolsTab from "./PoolsTab";
import LiquidityTab from "./LiquidityTab";

const Pools = () => {
  const { data: tokenPrices, isLoading } = useOraclePrices();

  const [tab, setTab] = useState(0);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    },
    [setTab]
  );

  const tabContent = useMemo(() => {
    if (tab === 0)
      return <PoolsTab tokenPrices={tokenPrices ? tokenPrices.rest : {}} />;
    if (tab === 1)
      return <LiquidityTab tokenPrices={tokenPrices ? tokenPrices.rest : {}} />;
  }, [tab, tokenPrices]);

  return (
    <HydraPage
      icon={<Hydraswap />}
      title={"Pools"}
      description={"Providing liquidity can earn swap fees and farm income."}
      content={
        isLoading ? (
          <LoaderSpinner />
        ) : (
          !!tokenPrices && (
            <TabPageWrapper>
              <Tabs tab={tab} onChange={handleChange}>
                <Tab label="Pools" />
                <Tab label="My liquidity" />
              </Tabs>
              <TabContainer>{tabContent}</TabContainer>
            </TabPageWrapper>
          )
        )
      }
    />
  );
};

export default Pools;
