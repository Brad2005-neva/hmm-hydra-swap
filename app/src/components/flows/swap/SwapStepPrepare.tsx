import { FC, useCallback, useState, Dispatch, SetStateAction } from "react";
import { IconButton } from "@mui/material";
import { Asset, PoolFeeType } from "@hydraprotocol/sdk";
import { TokenField } from "@hydraprotocol/services";

import { SwapLayout } from "@ui/layout/SwapLayout";
import { Gear } from "@ui/icons";
import { SwapPanel } from "./SwapPanel";
import { SwapSettings } from "./SwapSettings";
import { AssetSelector } from "./AssetSelector";
import { useBalanceAssetMap } from "./useBalanceAssetMap";

interface SwapStepPrepareProps {
  slippage: bigint;
  updateSlippage: (value: bigint) => void;
  assetsTokenFrom: Asset[];
  assetsTokenTo: Asset[];
  tokenFrom: TokenField;
  tokenTo: TokenField;
  setFocus: Dispatch<SetStateAction<"from" | "to">>;
  toggleFields: () => void;
  canSwap: boolean;
  poolExists: boolean;
  poolPairSelected: boolean;
  cValue: number | undefined;
  fee: bigint;
  feeType: PoolFeeType | undefined;
  isHMM: boolean | undefined;
  loading: boolean;
  onConfirm: () => void;
}

export const SwapStepPrepare: FC<SwapStepPrepareProps> = ({
  slippage,
  updateSlippage,
  assetsTokenFrom,
  assetsTokenTo,
  tokenFrom,
  tokenTo,
  setFocus,
  toggleFields,
  canSwap,
  poolExists,
  poolPairSelected,
  cValue,
  fee,
  feeType,
  isHMM,
  loading,
  onConfirm,
}) => {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState("");
  const [assetList, setAssetList] = useState<Asset[]>([]);

  const openSettingModal = useCallback(
    () => setShowSettingModal(true),
    [setShowSettingModal]
  );

  const closeSettingModal = useCallback(
    () => setShowSettingModal(false),
    [setShowSettingModal]
  );

  const openAssetSelector = useCallback(
    (direction: string) => {
      setSelectedDirection(direction);
      setAssetList(direction === "from" ? assetsTokenFrom : assetsTokenTo);
      setShowAssetSelector(true);
    },
    [
      setSelectedDirection,
      setAssetList,
      setShowAssetSelector,
      assetsTokenFrom,
      assetsTokenTo,
    ]
  );

  const changeAsset = useCallback(
    (asset: Asset) => {
      if (selectedDirection === "from") tokenFrom.setAsset(asset);
      else tokenTo.setAsset(asset);

      setSelectedDirection("");
      setShowAssetSelector(false);
    },
    [
      selectedDirection,
      setSelectedDirection,
      setShowAssetSelector,
      tokenFrom,
      tokenTo,
    ]
  );

  const closeAssetSelector = useCallback(
    () => setShowAssetSelector(false),
    [setShowAssetSelector]
  );

  const balances = useBalanceAssetMap();

  return (
    <>
      <SwapLayout
        title={"Swap"}
        swapIcons={
          <IconButton onClick={openSettingModal} aria-label="Slippage Setting">
            <Gear />
          </IconButton>
        }
      >
        <SwapPanel
          tokenFrom={tokenFrom}
          tokenTo={tokenTo}
          onSwitchToken={openAssetSelector}
          balances={balances}
          setFocus={setFocus}
          toggleFields={toggleFields}
          canSwap={canSwap}
          poolExists={poolExists}
          poolPairSelected={poolPairSelected}
          cValue={cValue}
          fee={fee}
          feeType={feeType}
          isHMM={isHMM}
          loading={loading}
          onConfirm={onConfirm}
        />
      </SwapLayout>

      <SwapSettings
        open={showSettingModal}
        onClose={closeSettingModal}
        slippage={slippage}
        setSlippage={updateSlippage}
      />

      <AssetSelector
        open={showAssetSelector}
        onClose={closeAssetSelector}
        assetList={assetList}
        setAsset={changeAsset}
        balances={balances}
      />
    </>
  );
};

export default SwapStepPrepare;
