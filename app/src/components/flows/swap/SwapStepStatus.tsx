import { FC, useMemo } from "react";
import { useNetworkProvider, TokenField } from "@hydraprotocol/services";
import { Decimal } from "@hydraprotocol/sdk";

import { HydraModal } from "@ui/hydraModal";
import { SwapUIState } from "@hydraprotocol/services";
import { StatusProcessing } from "@ui/transactionStatus/statusProcessing";
import { StatusDone } from "@ui/transactionStatus/statusDone";
import { StatusFail } from "@ui/transactionStatus/statusFail";

interface SwapStepStatusProps {
  open: boolean;
  onClose(): void;
  tokenFrom: TokenField;
  tokenTo: TokenField;
  state: SwapUIState;
}

export const SwapStepStatus: FC<SwapStepStatusProps> = ({
  open,
  onClose,
  tokenFrom,
  tokenTo,
  state,
}) => {
  const { meta } = useNetworkProvider();

  const processingContent = `Swapping ${Decimal.from(
    tokenFrom?.amount,
    BigInt(tokenFrom?.asset?.decimals || 9)
  ).toFormat(Decimal.FORMAT_TOKEN, tokenFrom?.asset?.decimals)} ${
    tokenFrom?.asset?.symbol
  } for ${Decimal.from(
    tokenTo?.amount,
    BigInt(tokenTo?.asset?.decimals || 9)
  ).toFormat(Decimal.FORMAT_TOKEN, tokenTo?.asset?.decimals)} ${
    tokenTo?.asset?.symbol
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
