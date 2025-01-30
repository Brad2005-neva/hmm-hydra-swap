import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { PoolDescriptor, useAddLiquidity } from "@hydraprotocol/services";
import {
  DepositStepConfirm,
  DepositStepPrepare,
  DepositStepStatus,
  useBalanceByAddress,
} from ".";

export function DepositFlow({
  poolDescriptor,
  tokenAInitAddress,
  tokenBInitAddress,
  onFlowEnd,
}: {
  poolDescriptor: PoolDescriptor;
  tokenAInitAddress: string;
  tokenBInitAddress: string;
  onFlowEnd: () => void;
}) {
  const {
    tokenXVault,
    tokenYVault,
    tokenA,
    tokenB,
    setFocus,
    isSubmitDisabled,
    onSendSubmit,
    onSendCancel,
    state,
    cValue,
  } = useAddLiquidity(
    100n,
    poolDescriptor,
    tokenAInitAddress,
    tokenBInitAddress,
    (hash: string) => {
      console.log(hash);
      toast.success("Transaction Completed");
    },
    (error: any) => {
      console.log({ error });
      toast.error("Transaction Rejected");
    }
  );

  const [showDepositModal, setShowDepositModal] = useState(true);
  const [showDepositStepConfirm, setShowDepositStepConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const tokenABalance = useBalanceByAddress(tokenAInitAddress);
  const tokenBBalance = useBalanceByAddress(tokenBInitAddress);

  const [tokenAVault, tokenBVault] =
    `${tokenXVault?.account.data.mint}` === `${tokenA.mint}`
      ? [tokenXVault, tokenYVault]
      : [tokenYVault, tokenXVault];

  const reset = useCallback(() => {
    setShowDepositModal(true);
    setShowDepositStepConfirm(false);
    setShowStatusModal(false);
    onSendCancel();
    onFlowEnd();
  }, [onFlowEnd, onSendCancel, setShowDepositModal]);

  const confirmDeposit = useCallback(() => {
    onSendSubmit();
    setShowDepositModal(false);
    setShowDepositStepConfirm(true);
  }, [onSendSubmit, setShowDepositModal, setShowDepositStepConfirm]);

  const handleCloseDepositConfirm = useCallback(() => {
    reset();
  }, [reset]);

  const handleDepositApprove = useCallback(() => {
    onSendSubmit();
    setShowDepositStepConfirm(false);
    setShowStatusModal(true);
  }, [onSendSubmit, setShowDepositStepConfirm, setShowStatusModal]);

  const handlePoolStatusClose = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <>
      <DepositStepPrepare
        open={showDepositModal}
        onClose={reset}
        tokenA={tokenA}
        tokenB={tokenB}
        tokenABalance={tokenABalance}
        tokenBBalance={tokenBBalance}
        setFocus={setFocus}
        isSubmitDisabled={isSubmitDisabled}
        onConfirm={confirmDeposit}
        tokenAVault={tokenAVault}
        tokenBVault={tokenBVault}
        cValue={cValue}
      />

      <DepositStepConfirm
        open={showDepositStepConfirm}
        onClose={handleCloseDepositConfirm}
        tokenA={tokenA}
        tokenB={tokenB}
        onApprove={handleDepositApprove}
      />

      <DepositStepStatus
        open={showStatusModal}
        onClose={handlePoolStatusClose}
        assetA={tokenA.asset}
        assetAAmount={tokenA.amount}
        assetB={tokenB.asset}
        assetBAmount={tokenB.amount}
        state={state}
        percent={0n}
        status={"deposit"}
      />
    </>
  );
}
