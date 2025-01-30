import { useState } from "react";
import { useTokenForm } from "../useTokenForm";
import { usePoolStateFromSearch } from "../usePoolState";
import { useHydraClient } from "../HydraClientProvider";
import { useCalculateSwapResult } from "./useCalculateSwapResult";
import { useSwapUIState } from "./useSwapUIState";
import { EnrichedPoolState } from "../../services";
import { TxSuccessFn, TxFailureFn } from "../../services/types";
import { useSwapCommand } from "./useSwapCommand";

function getPoolDescriptorFromState(enrichedPoolState: EnrichedPoolState) {
  const tokenXMint = enrichedPoolState.tokenXMint?.pubkey;
  const tokenYMint = enrichedPoolState.tokenYMint?.pubkey;
  const poolId = enrichedPoolState.poolState?.account.data.poolId;

  if (!tokenXMint || !tokenYMint || typeof poolId === "undefined") return;
  return { tokenXMint, tokenYMint, poolId };
}

export function useSwap(
  slippage: bigint,
  onTxSuccess: TxSuccessFn,
  onTxFailure: TxFailureFn
) {
  const sdk = useHydraClient();

  const [fee, setFee] = useState<bigint>(0n);

  // get form data and controls
  const {
    assetsTokenA: assetsTokenFrom,
    assetsTokenB: assetsTokenTo,
    focus,
    setFocus,
    toggleFields,
    tokenA: tokenFrom,
    tokenB: tokenTo,
  } = useTokenForm();

  // get pool values
  const { value: pool, loading } = usePoolStateFromSearch(
    tokenFrom.mint,
    tokenTo.mint
  );

  // set reactive form fields based on input
  useCalculateSwapResult(sdk.ctx.log, pool, tokenFrom, tokenTo, focus, setFee);

  // get modal state and handlers
  const minimumAmountOut = (tokenTo.amount * (10_000n - slippage)) / 10_000n;

  const maybePoolDescriptor = getPoolDescriptorFromState(pool);

  const executeSwap = useSwapCommand(
    sdk,
    tokenFrom,
    tokenTo,
    minimumAmountOut,
    maybePoolDescriptor
  );

  const { onSendSubmit, onSendCancel, state } = useSwapUIState(
    executeSwap,
    onTxSuccess,
    onTxFailure
  );

  const cValue = pool.poolState?.account.data.cValue;

  const tokenXVaultAmount = pool.tokenXVault?.account.data.amount ?? 0n;
  const tokenYVaultAmount = pool.tokenYVault?.account.data.amount ?? 0n;

  // get booleans for interface
  const poolExists = !!pool.poolState;
  const poolPairSelected = !!tokenFrom.asset && !!tokenTo.asset;
  const isSubmitDisabled = !(poolExists && sdk.ctx.isSignedIn());
  const feeType = pool.poolState?.account.data.fees.feeCalculation;
  const isHMM = cValue ? Boolean(cValue > 0) : undefined;
  const hasLiquidity = tokenXVaultAmount > 0n && tokenYVaultAmount > 0n;
  // Send it all down
  return {
    ...pool,
    cValue,
    assetsTokenFrom,
    assetsTokenTo,
    isSubmitDisabled,
    focus,
    minimumAmountOut,
    onSendCancel,
    onSendSubmit,
    poolExists,
    poolPairSelected,
    setFocus,
    state,
    toggleFields,
    tokenFrom,
    tokenTo,
    fee,
    feeType,
    isHMM,
    hasLiquidity,
    loading,
  };
}
