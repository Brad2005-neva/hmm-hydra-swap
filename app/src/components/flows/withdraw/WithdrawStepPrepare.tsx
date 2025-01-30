import { FC } from "react";

import { AccountData, TokenAccount, TokenMint } from "@hydraprotocol/sdk";
import { TokenField } from "@hydraprotocol/services";
import { HydraModal } from "@ui/hydraModal";
import WithdrawLiquidityAmount from "@ui/withdrawLiquidity/withdrawLiquidityAmount";
import TokenAmount from "@ui/withdrawLiquidity/withdrawTokenAmount";
import BurntTokens from "../../burntTokens";
import DisplayCValue from "../../cValue";

interface WithdrawStepPrepareProps {
  open: boolean;
  onClose(): void;
  percent: bigint;
  lpTokensToBurn: bigint;
  setPercent(value: bigint): void;
  isSubmitDisabled: boolean;
  onConfirm(): void;
  lpTokenMint?: AccountData<TokenMint>;
  tokenA: TokenField;
  tokenB: TokenField;
  tokenAVault?: AccountData<TokenAccount>;
  tokenBVault?: AccountData<TokenAccount>;
  lpSupply: bigint;
  lpAmount: bigint;
  cValue?: number;
}

export const WithdrawStepPrepare: FC<WithdrawStepPrepareProps> = ({
  open,
  onClose,
  percent,
  setPercent,
  isSubmitDisabled,
  onConfirm,
  lpTokensToBurn,
  lpTokenMint,
  tokenA,
  tokenB,
  tokenAVault,
  tokenBVault,
  lpSupply,
  lpAmount,
  cValue = 0,
}) => {
  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Withdraw Liquidity"
      mainContent={
        <WithdrawLiquidityAmount percent={percent} setPercent={setPercent} />
      }
      subContent={
        <>
          <TokenAmount
            tokenA={tokenA}
            tokenAVault={tokenAVault}
            tokenB={tokenB}
            tokenBVault={tokenBVault}
            percent={percent}
            lpSupply={lpSupply}
            lpAmount={lpAmount}
          />
          <BurntTokens
            lpTokensToBurn={lpTokensToBurn}
            lpTokenMint={lpTokenMint}
          />
          <DisplayCValue cValue={cValue} />
        </>
      }
      buttonText="Withdraw"
      buttonDisabled={isSubmitDisabled}
      onConfirm={onConfirm}
      buttonAriaLabel="Trigger Withdraw"
    />
  );
};
