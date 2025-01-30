import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { PoolDescriptor, useRemoveLiquidity } from "@hydraprotocol/services";
import { Asset, Decimal } from "@hydraprotocol/sdk";
import {
  WithdrawStepConfirm,
  WithdrawStepPrepare,
  WithdrawStepStatus,
} from ".";

export function WithdrawalFlow({
  poolDescriptor,
  tokenAAsset,
  tokenBAsset,
  onFlowEnd,
}: {
  poolDescriptor: PoolDescriptor;
  tokenAAsset: Asset;
  tokenBAsset: Asset;
  onFlowEnd: () => void;
}) {
  const {
    isSubmitDisabled,
    onSendSubmit,
    onSendCancel,
    percent,
    setPercent,
    lpTokenBalance,
    lpTokensToBurn,
    lpTokenMint,
    tokenA,
    tokenB,
    tokenXVault,
    tokenYVault,
    state,
    cValue,
  } = useRemoveLiquidity(
    poolDescriptor,
    tokenAAsset.address,
    tokenBAsset.address,
    (hash: string) => {
      console.log(hash);
      toast.success("Transaction Completed");
    },
    (error: any) => {
      console.log({ error });
      toast.error("Transaction Rejected");
    }
  );
  const [showWithdrawModal, setShowWithdrawModal] = useState(true);
  const [showWithdrawStepConfirm, setShowWithdrawStepConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const reset = useCallback(() => {
    setShowWithdrawModal(true);
    setShowWithdrawStepConfirm(false);
    setShowStatusModal(false);
    onSendCancel();
    onFlowEnd();
  }, [onFlowEnd, onSendCancel]);

  const confirmWithdraw = useCallback(() => {
    onSendSubmit();
    setShowWithdrawModal(false);
    setShowWithdrawStepConfirm(true);
  }, [onSendSubmit]);

  const handleCloseWithdrawConfirm = useCallback(() => {
    reset();
  }, [reset]);

  const handleWithdrawApprove = useCallback(() => {
    onSendSubmit();
    setShowWithdrawStepConfirm(false);
    setShowStatusModal(true);
  }, [onSendSubmit]);

  const handlePoolStatusClose = useCallback(() => {
    reset();
  }, [reset]);

  const [tokenAVault, tokenBVault] =
    `${tokenXVault?.account.data.mint}` === `${tokenA.mint}`
      ? [tokenXVault, tokenYVault]
      : [tokenYVault, tokenXVault];

  const lpDecimals = BigInt(lpTokenMint?.account.data.decimals || 0);

  const lpTokenSupply = Decimal.from(
    lpTokenMint?.account.data.supply || 1n,
    lpDecimals
  );

  return (
    <>
      <WithdrawStepPrepare
        open={showWithdrawModal}
        onClose={reset}
        percent={percent}
        setPercent={setPercent}
        isSubmitDisabled={isSubmitDisabled}
        onConfirm={confirmWithdraw}
        lpTokensToBurn={lpTokensToBurn}
        lpTokenMint={lpTokenMint}
        tokenA={tokenA}
        tokenB={tokenB}
        tokenAVault={tokenAVault}
        tokenBVault={tokenBVault}
        lpSupply={lpTokenSupply.unscale(lpDecimals)}
        lpAmount={lpTokenBalance}
        cValue={cValue}
      />

      <WithdrawStepConfirm
        open={showWithdrawStepConfirm}
        onClose={handleCloseWithdrawConfirm}
        tokenA={tokenA}
        tokenB={tokenB}
        percent={percent}
        tokenAVault={tokenAVault}
        tokenBVault={tokenBVault}
        lpSupply={lpTokenSupply.unscale(lpDecimals)}
        lpAmount={lpTokenBalance}
        lpTokensToBurn={lpTokensToBurn}
        lpTokenMint={lpTokenMint}
        onApprove={handleWithdrawApprove}
      />
      <WithdrawStepStatus
        open={showStatusModal}
        onClose={handlePoolStatusClose}
        assetA={tokenAAsset}
        assetAAmount={0n}
        assetB={tokenBAsset}
        assetBAmount={0n}
        state={state}
        percent={percent}
        status={"withdrawal"}
      />
    </>
  );
}
