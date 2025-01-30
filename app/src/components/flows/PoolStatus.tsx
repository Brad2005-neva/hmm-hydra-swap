import { FC, useMemo } from "react";
import { useNetworkProvider } from "@hydraprotocol/services";
import { Asset } from "@hydraprotocol/sdk";

import { toFormat } from "@utils/toFormat";
import { HydraModal } from "@ui/hydraModal";
import { AddLiquidityUIState } from "@hydraprotocol/services";
import { RemoveLiquidityUIState } from "@hydraprotocol/services";
import { StatusProcessing } from "@ui/transactionStatus/statusProcessing";
import { StatusDone } from "@ui/transactionStatus/statusDone";
import { StatusFail } from "@ui/transactionStatus/statusFail";

interface PoolStatusModalProps {
  open: boolean;
  onClose(): void;
  assetA: Asset | undefined;
  assetAAmount: bigint;
  assetB: Asset | undefined;
  assetBAmount: bigint;
  state: AddLiquidityUIState | RemoveLiquidityUIState;
  percent: bigint;
  status: string;
}

export const PoolStatusModal: FC<PoolStatusModalProps> = ({
  open,
  onClose,
  assetA,
  assetAAmount,
  assetB,
  assetBAmount,
  state,
  percent,
  status,
}) => {
  const { meta } = useNetworkProvider();

  const processingContent =
    status === "deposit"
      ? `Deposit ${toFormat(assetAAmount, assetA?.decimals)} ${
          assetA?.symbol
        } and ${toFormat(assetBAmount, assetB?.decimals)} ${assetB?.symbol}`
      : `Withdraw ${Number(percent) / 100}% of Pool - ${assetA?.symbol} and ${
          assetB?.symbol
        }`;

  const hashLink = useMemo(() => {
    return `https://explorer.solana.com/tx/${state.context.hash}?cluster=${
      meta.network === "localnet" ? "custom" : meta.network
    }`;
  }, [meta.network, state.context.hash]);

  return (
    <HydraModal
      open={open}
      onClose={onClose}
      mainContent={
        <>
          {state.matches("process") && (
            <StatusProcessing content={processingContent} />
          )}
          {state.matches("done") && state.context.hash && (
            <StatusDone hashLink={hashLink} onClose={onClose} />
          )}
          {state.matches("error") && (
            <StatusFail error={state.context.error} onClose={onClose} />
          )}
        </>
      }
    />
  );
};
