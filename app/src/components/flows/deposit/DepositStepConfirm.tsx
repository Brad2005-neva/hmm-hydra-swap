import { FC } from "react";
import { TokenField } from "@hydraprotocol/services";
import { Decimal } from "@hydraprotocol/sdk";

import { HydraModal } from "@ui/hydraModal";
import { SummaryItem } from "@ui/transactionSummary/SummaryItem";
import { PlusSvg } from "@ui/transactionSummary/SummaryIcons";

interface DepositStepConfirmProps {
  open: boolean;
  onClose(): void;
  tokenA: TokenField;
  tokenB: TokenField;
  onApprove(): void;
}

export const DepositStepConfirm: FC<DepositStepConfirmProps> = ({
  open,
  onClose,
  tokenA,
  tokenB,
  onApprove,
}) => {
  const aAmount = Decimal.fromToken(tokenA).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenA.asset?.decimals
  );
  const bAmount = Decimal.fromToken(tokenB).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenB.asset?.decimals
  );

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Confirm Deposit"
      mainContent={
        <>
          <SummaryItem token={tokenA} amount={aAmount} />
          <PlusSvg />
          <SummaryItem token={tokenB} amount={bAmount} />
        </>
      }
      buttonText="Confirm Deposit"
      onConfirm={onApprove}
      buttonAriaLabel="Confirm Trigger Deposit"
    />
  );
};
