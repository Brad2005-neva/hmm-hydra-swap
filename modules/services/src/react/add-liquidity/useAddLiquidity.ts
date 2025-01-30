import { useHydraClient } from "../HydraClientProvider";
import { usePoolStateFromDescriptor } from "../usePoolState";
import { useTokenForm } from "../useTokenForm";
import { useAddLiquidityUIState } from "./useAddLiquidityUIState";
import { useCalculateLiquidityResult } from "./useCalculateAddLiquidityAmount";
import { PoolDescriptor } from "../../services";
import { TxSuccessFn, TxFailureFn } from "../../services/types";
import { useAddLiquidityCommand } from "./useAddLiquidityCommand";

export function useAddLiquidity(
  slippage: bigint,
  poolDescriptor: PoolDescriptor,
  tokenAInit: string,
  tokenBInit: string,
  onTxSuccess: TxSuccessFn,
  onTxFailure: TxFailureFn
) {
  // get form data and controls
  const sdk = useHydraClient();

  const { assetsTokenA, assetsTokenB, focus, setFocus, tokenA, tokenB } =
    useTokenForm({
      tokenAInit,
      tokenBInit,
    });

  // get pool values
  const { value: pool } = usePoolStateFromDescriptor(poolDescriptor);

  // TODO:
  // We will likely create a guided liquidity mode so this may need to be
  // more extensibe
  useCalculateLiquidityResult(sdk, pool, tokenA, tokenB, focus);

  const [tokenXAmount, tokenYAmount] =
    tokenA.asset?.address === `${poolDescriptor.tokenXMint}`
      ? [tokenA.amount, tokenB.amount]
      : [tokenB.amount, tokenA.amount];

  const executeAddLiquidity = useAddLiquidityCommand(
    sdk,
    poolDescriptor,
    tokenXAmount,
    tokenYAmount,
    slippage
  );

  const { onSendSubmit, onSendCancel, state } = useAddLiquidityUIState(
    executeAddLiquidity,
    onTxSuccess,
    onTxFailure
  );

  const cValue = pool.poolState?.account.data.cValue;

  const isSubmitDisabled = !(
    tokenA.asset &&
    tokenB.asset &&
    tokenA.amount > 0n &&
    tokenB.amount > 0n
  );

  return {
    ...pool,
    assetsTokenA,
    assetsTokenB,
    focus,
    isSubmitDisabled,
    onSendCancel,
    onSendSubmit,
    setFocus,
    state,
    tokenA,
    tokenB,
    cValue,
  };
}
