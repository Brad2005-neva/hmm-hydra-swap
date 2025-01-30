import { FC, useCallback } from "react";

import { AccountData, TokenAccount } from "@hydraprotocol/sdk";
import { TokenField } from "@hydraprotocol/services";
import { HydraModal } from "@ui/hydraModal";
import { AmountDetailContainer } from "@ui/depositLiquidity";
import ExchangeRate from "@ui/exchangeRate";
import PoolLiquidity from "../../poolLiquidity";
import DisplayCValue from "../../cValue";

interface DepositStepPrepareProps {
  open: boolean;
  onClose(): void;
  tokenA: TokenField;
  tokenB: TokenField;
  tokenABalance: bigint;
  tokenBBalance: bigint;
  setFocus(position: "from" | "to"): void;
  isSubmitDisabled: boolean;
  onConfirm(): void;
  tokenAVault?: AccountData<TokenAccount>;
  tokenBVault?: AccountData<TokenAccount>;
  cValue?: number;
}

export const DepositStepPrepare: FC<DepositStepPrepareProps> = ({
  open,
  onClose,
  tokenA,
  tokenB,
  tokenABalance,
  tokenBBalance,
  setFocus,
  isSubmitDisabled,
  onConfirm,
  tokenAVault,
  tokenBVault,
  cValue = 0,
}) => {
  const setMaxFromBalance = useCallback(() => {
    tokenA.setAmount(tokenABalance);

    setFocus("from");
  }, [tokenA, tokenABalance, setFocus]);

  const setMaxToBalance = useCallback(() => {
    tokenB.setAmount(tokenBBalance);

    setFocus("to");
  }, [tokenB, tokenBBalance, setFocus]);

  const attemptToDepositMoreThanBalance =
    tokenA.amount > tokenABalance || tokenB.amount > tokenBBalance;

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      title="Deposit Liquidity"
      mainContent={
        <AmountDetailContainer
          tokenA={tokenA}
          tokenABalance={tokenABalance}
          tokenB={tokenB}
          tokenBBalance={tokenBBalance}
          setMaxFromBalance={setMaxFromBalance}
          setMaxToBalance={setMaxToBalance}
          setFocus={setFocus}
        />
      }
      subContent={
        <>
          <ExchangeRate
            tokenA={tokenA}
            tokenB={tokenB}
            tokenAAmount={tokenAVault?.account.data.amount}
            tokenBAmount={tokenBVault?.account.data.amount}
            tabIndex={1}
          />
          <PoolLiquidity
            tokenA={tokenA}
            tokenB={tokenB}
            tokenAVault={tokenAVault}
            tokenBVault={tokenBVault}
          />
          <DisplayCValue cValue={cValue} />
        </>
      }
      buttonText={
        tokenA.amount <= 0 || tokenB.amount <= 0 ? "Enter amounts" : "Deposit"
      }
      buttonDisabled={
        attemptToDepositMoreThanBalance ||
        tokenA.amount <= 0 ||
        tokenB.amount <= 0 ||
        isSubmitDisabled
      }
      onConfirm={onConfirm}
      buttonAriaLabel="Trigger Deposit"
    />
  );
};
