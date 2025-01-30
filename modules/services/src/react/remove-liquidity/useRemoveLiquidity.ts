import { useHydraClient } from "../HydraClientProvider";
import { useRemoveLiquidityUIState } from "./useRemoveLiquidityUIState";
import { useState } from "react";
import { usePoolStateFromDescriptor } from "../usePoolState";
import { useTokenForm } from "../useTokenForm";
import { PoolDescriptor } from "../../services";
import { TxSuccessFn, TxFailureFn } from "../../services/types";
import { useRemoveLiquidityCommand } from "./useRemoveLiquidityCommand";

export function useRemoveLiquidity(
  poolDescriptor: PoolDescriptor,
  tokenAInit: string,
  tokenBInit: string,
  onTxSuccess: TxSuccessFn,
  onTxFailure: TxFailureFn
) {
  // get form data and controls
  const sdk = useHydraClient();
  const { assetsTokenA, assetsTokenB, tokenA, tokenB } = useTokenForm({
    tokenAInit,
    tokenBInit,
  });

  const [percent, setPercent] = useState(0n);

  const { value: pool } = usePoolStateFromDescriptor(poolDescriptor);

  const executeRemoveLiquidity = useRemoveLiquidityCommand(
    sdk,
    poolDescriptor,
    percent,
    pool.lpTokenAssociatedAccount
  );

  const { onSendSubmit, onSendCancel, state } = useRemoveLiquidityUIState(
    executeRemoveLiquidity,
    onTxSuccess,
    onTxFailure
  );

  const lpTokenBalance =
    pool.lpTokenAssociatedAccount?.account.data.amount ?? 0n;
  const lpTokensToBurn = (percent * lpTokenBalance) / 100_00n;

  const hasLiquidityInPool = Boolean(lpTokenBalance > 0n);
  const isSubmitDisabled = percent === 0n;
  const cValue = pool.poolState?.account.data.cValue;
  return {
    ...pool,
    assetsTokenA,
    assetsTokenB,
    lpTokenBalance,
    lpTokensToBurn,
    hasLiquidityInPool,
    isSubmitDisabled,
    onSendCancel,
    onSendSubmit,
    percent,
    setPercent,
    tokenA,
    tokenB,
    state,
    cValue,
  };
}
