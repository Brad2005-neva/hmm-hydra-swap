import React, { FC, useEffect, useState, useCallback } from "react";
import { Asset } from "@hydraprotocol/sdk";
import { useNetworkProvider } from "@hydraprotocol/services";

import { AssetBalance } from "@types";
import { HydraModal } from "@ui/hydraModal";
import {
  SearchAsset,
  SelectTitle,
  AssetListWrapper,
  AssetItem,
} from "@ui/swapAssetList";

interface AssetSelectorProps {
  open: boolean;
  onClose(): void;
  assetList: Array<Asset>;
  setAsset(asset: Asset): void;
  balances: AssetBalance;
}

export const AssetSelector: FC<AssetSelectorProps> = ({
  open,
  onClose,
  assetList,
  setAsset,
  balances,
}) => {
  const { meta } = useNetworkProvider();

  const [search, setSearch] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const tempAssets = assetList.filter((asset) =>
      asset.symbol.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAssets(tempAssets);
  }, [assetList, search]);

  const updateSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    [setSearch]
  );

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Select a token"
      mainContent={
        <>
          <SearchAsset
            value={search}
            onChange={updateSearch}
            placeholder="Search name or past address"
          />
          <SelectTitle>Token Name</SelectTitle>
          <AssetListWrapper>
            {filteredAssets.length > 0 &&
              filteredAssets.map((asset, index) => (
                <AssetItem
                  asset={asset}
                  onClick={setAsset}
                  balances={balances}
                  network={meta.network}
                  key={index}
                />
              ))}
          </AssetListWrapper>
        </>
      }
    />
  );
};
