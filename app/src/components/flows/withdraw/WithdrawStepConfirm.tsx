import { FC } from "react";
import { Typography } from "@mui/material";
import { TokenField } from "@hydraprotocol/services";
import {
  AccountData,
  Decimal,
  TokenAccount,
  TokenMint,
} from "@hydraprotocol/sdk";

import { HydraModal } from "@ui/hydraModal";
import { SummaryItem } from "@ui/transactionSummary/SummaryItem";
import { ExchangeSvg } from "@ui/transactionSummary/SummaryIcons";
import InlineData from "@ui/inlineData";

interface WithdrawStepConfirmProps {
  open: boolean;
  onClose(): void;
  tokenA: TokenField;
  tokenB: TokenField;
  percent: bigint;
  tokenAVault?: AccountData<TokenAccount>;
  tokenBVault?: AccountData<TokenAccount>;
  lpSupply: bigint;
  lpAmount: bigint;
  lpTokenMint?: AccountData<TokenMint>;
  lpTokensToBurn: bigint;
  onApprove(): void;
}

export const WithdrawStepConfirm: FC<WithdrawStepConfirmProps> = ({
  open,
  onClose,
  tokenA,
  tokenB,
  percent,
  tokenAVault,
  tokenBVault,
  lpSupply,
  lpAmount,
  lpTokenMint,
  lpTokensToBurn,
  onApprove,
}) => {
  const tokenAAmount = Decimal.fromVaultAndToken(tokenAVault, tokenA);
  const tokenBAmount = Decimal.fromVaultAndToken(tokenBVault, tokenB);
  const percentToDecimal = Decimal.from(percent, 4n);

  const lpSupplyToDecimal = Decimal.from(lpSupply, 9n);
  const lpAmountToDecimal = Decimal.from(lpAmount, 9n);

  const tokenAWithdrawn = tokenAAmount
    .mul(percentToDecimal)
    .mul(lpAmountToDecimal)
    .div(lpSupplyToDecimal)
    .toFormat(Decimal.FORMAT_TOKEN, tokenA.asset?.decimals);

  const tokenBWithdrawn = tokenBAmount
    .mul(percentToDecimal)
    .mul(lpAmountToDecimal)
    .div(lpSupplyToDecimal)
    .toFormat(Decimal.FORMAT_TOKEN, tokenB.asset?.decimals);

  const burntTokens = Decimal.fromAmountAndMint(
    lpTokensToBurn,
    lpTokenMint
  ).toFormat(Decimal.FORMAT_TOKEN, lpTokenMint?.account.data.decimals || 9);

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Confirm Withdraw"
      mainContent={
        <>
          <SummaryItem token={tokenA} amount={tokenAWithdrawn} />
          <ExchangeSvg />
          <SummaryItem token={tokenB} amount={tokenBWithdrawn} />
        </>
      }
      subContent={
        <>
          <InlineData
            title="LP tokens to be burnt"
            main={
              <Typography aria-label="Burnt Tokens Amount">
                {burntTokens}
              </Typography>
            }
          />
          <InlineData
            title="Withdraw percentage"
            main={
              <Typography aria-label="Burnt Tokens Percentage">{`${
                Number(percent) / 100
              }%`}</Typography>
            }
          />
        </>
      }
      buttonText={`Confirm Withdraw`}
      onConfirm={onApprove}
      buttonAriaLabel="Confirm Trigger Withdraw"
    />
  );
};
