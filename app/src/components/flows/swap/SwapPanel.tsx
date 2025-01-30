import { FC } from "react";
import { TokenField } from "@hydraprotocol/services";
import { PoolFeeType } from "@hydraprotocol/sdk";

import { AssetBalance } from "@types";
import SwapWarning from "@ui/swapWarning";
import { SwapContainer } from "@ui/swapContainer";
import { SwapTokens } from "@ui/swapTokens";
import { SwapInfo } from "@ui/swapInfo";
import { SwapButton } from "@ui/swapButton";

interface SwapProps {
  tokenFrom: TokenField;
  tokenTo: TokenField;
  onSwitchToken: (type: string) => void;
  balances: AssetBalance;
  setFocus: (focus: "from" | "to") => void;
  toggleFields: () => void;
  canSwap: boolean;
  poolExists: boolean;
  poolPairSelected?: boolean;
  onConfirm: () => void;
  fee: bigint;
  loading?: boolean;
  feeType?: PoolFeeType;
  cValue?: number;
  isHMM?: boolean;
}

export const SwapPanel: FC<SwapProps> = ({
  tokenFrom,
  tokenTo,
  onSwitchToken,
  balances,
  setFocus,
  toggleFields,
  canSwap,
  poolExists,
  poolPairSelected,
  onConfirm,
  fee,
  feeType,
  cValue,
  isHMM,
  loading,
}) => {
  const swapLabel =
    !tokenFrom.asset || !tokenTo.asset ? "Select a token" : "Swap";

  const tokenFromAddress = tokenFrom.asset?.address ?? "";
  const walletBalance = balances.get(tokenFromAddress) || 0n;
  const notEnoughBalanceInWallets =
    tokenFrom.asset && tokenFrom.amount > walletBalance;

  return (
    <SwapContainer>
      <SwapTokens
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        balances={balances}
        setFocus={setFocus}
        onSwitchToken={onSwitchToken}
        toggleFields={toggleFields}
      />
      {!loading && poolPairSelected && !poolExists && (
        <SwapWarning warning="There is no pool available for this pair" />
      )}
      <SwapInfo
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        isHMM={isHMM}
        fee={fee}
        feeType={feeType}
        cValue={cValue}
      />
      <SwapButton
        content={swapLabel}
        disabled={
          !tokenFrom.asset ||
          !tokenTo.asset ||
          tokenFrom.amount <= 0 ||
          tokenTo.amount <= 0 ||
          notEnoughBalanceInWallets ||
          !canSwap
        }
        onConfirm={onConfirm}
      />
    </SwapContainer>
  );
};

// export default SwapPanel;
