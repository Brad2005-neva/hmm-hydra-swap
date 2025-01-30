import { FC, useCallback } from "react";

import { HydraModal } from "@ui/hydraModal";
import { SwapSettingsView } from "@ui/settings";

interface SwapSettingsProps {
  open: boolean;
  onClose(): void;
  slippage: bigint;
  setSlippage(value: bigint): void;
}

export const SwapSettings: FC<SwapSettingsProps> = ({
  open,
  onClose,
  slippage,
  setSlippage,
}) => {
  const isError = slippage < 1n;
  const handleSlippageButtonClicked = useCallback(
    (amount: bigint) => {
      setSlippage(amount);
    },
    [setSlippage]
  );
  const handleSlippageChanged = useCallback(
    (value: number) => setSlippage(BigInt(value * 100)),
    [setSlippage]
  );
  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Settings"
      mainContent={
        <SwapSettingsView
          buttons={[
            { label: "0.1%", value: 10n },
            { label: "0.5%", value: 50n },
            { label: "1.0%", value: 100n },
          ]}
          slippage={slippage}
          isError={isError}
          onSlippageButtonClicked={handleSlippageButtonClicked}
          onSlippageChanged={handleSlippageChanged}
        />
      }
    />
  );
};
