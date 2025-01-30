import { useCallback, useState } from "react";
import { useSwap, useSlippage } from "@hydraprotocol/services";
import { toast } from "react-toastify";

import { SwapStepPrepare, SwapStepConfirm, SwapStepStatus } from ".";

export const SwapFlow = () => {
  const { slippage, setSlippage } = useSlippage();

  const {
    tokenFrom,
    tokenTo,
    assetsTokenFrom,
    assetsTokenTo,
    toggleFields,
    poolExists,
    poolPairSelected,
    isSubmitDisabled,
    setFocus,
    onSendSubmit,
    state,
    onSendCancel,
    fee,
    cValue,
    feeType,
    isHMM,
    loading,
  } = useSwap(
    slippage,
    (hash: string) => {
      console.log(hash);
      toast.success("Transaction Completed");
    },
    (error: any) => {
      console.log({ error });
      toast.error("Transaction Rejected");
    }
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const reset = useCallback(() => {
    setShowConfirmModal(false);
    setShowStatusModal(false);
    onSendCancel();
  }, [setShowConfirmModal, onSendCancel]);

  const updateSlippage = useCallback(
    (value: bigint) => setSlippage(value),
    [setSlippage]
  );

  const confirmSwap = useCallback(() => {
    onSendSubmit();
    setShowConfirmModal(true);
  }, [onSendSubmit, setShowConfirmModal]);

  const handleCloseSwapConfirm = useCallback(() => {
    reset();
  }, [reset]);

  const handleSwapApprove = useCallback(() => {
    onSendSubmit();
    setShowConfirmModal(false);
    setShowStatusModal(true);
  }, [onSendSubmit, setShowConfirmModal, setShowStatusModal]);

  const handleSwapStatusClose = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <>
      <SwapStepPrepare
        slippage={slippage}
        updateSlippage={updateSlippage}
        assetsTokenFrom={assetsTokenFrom}
        assetsTokenTo={assetsTokenTo}
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        setFocus={setFocus}
        toggleFields={toggleFields}
        canSwap={!isSubmitDisabled}
        poolExists={poolExists}
        poolPairSelected={poolPairSelected}
        cValue={cValue}
        fee={fee}
        feeType={feeType}
        isHMM={isHMM}
        loading={loading}
        onConfirm={confirmSwap}
      />

      <SwapStepConfirm
        open={showConfirmModal}
        onClose={handleCloseSwapConfirm}
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        onApprove={handleSwapApprove}
        fee={fee}
        isHMM={isHMM}
      />
      <SwapStepStatus
        open={showStatusModal}
        onClose={handleSwapStatusClose}
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        state={state}
      />
    </>
  );
};
