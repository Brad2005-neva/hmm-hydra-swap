import { FC } from "react";
import { TokenField } from "@hydraprotocol/services";
import { Decimal } from "@hydraprotocol/sdk";

import { HydraModal } from "@ui/hydraModal";
import { SummaryItem } from "@ui/transactionSummary/SummaryItem";
import { ArrowDownSvg } from "@ui/transactionSummary/SummaryIcons";
import ExchangeRate from "@ui/exchangeRate";
import SwapFee from "@components/swapFee";

interface SwapStepConfirmProps {
  open: boolean;
  onClose(): void;
  tokenFrom: TokenField;
  tokenTo: TokenField;
  onApprove(): void;
  fee: bigint;
  isHMM?: boolean;
}

export const SwapStepConfirm: FC<SwapStepConfirmProps> = ({
  open,
  onClose,
  tokenFrom,
  tokenTo,
  onApprove,
  fee,
  isHMM,
}) => {
  const fromAmount = Decimal.fromToken(tokenFrom).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenFrom.asset?.decimals
  );
  const toAmount = Decimal.fromToken(tokenTo).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenTo.asset?.decimals
  );

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Confirm Swap"
      mainContent={
        <>
          <SummaryItem token={tokenFrom} amount={fromAmount} />
          <ArrowDownSvg />
          <SummaryItem token={tokenTo} amount={toAmount} />
        </>
      }
      subContent={
        <>
          <ExchangeRate
            tokenA={tokenFrom}
            tokenB={tokenTo}
            tokenAAmount={tokenFrom.amount}
            tokenBAmount={tokenTo.amount}
            flip
            isHMM={isHMM}
          />
          <SwapFee fee={fee} />
        </>
      }
      buttonText="Confirm Swap"
      onConfirm={onApprove}
      buttonAriaLabel="Confirm Trigger Swap"
    />
  );
};
