import { Asset } from "@hydraprotocol/sdk";
import { PoolDescriptor } from "@hydraprotocol/services";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { WalletModal } from "../wallet";
import { DepositFlow } from "./deposit/DepositFlow";
import { WithdrawalFlow } from "./withdraw/WithdrawalFlow";
import { createContext, useContext, Dispatch, SetStateAction } from "react";

type FlowContextType = {
  startDepositFlow: (a: Asset, b: Asset, d: PoolDescriptor) => void;
  endDepositFlow: () => void;
  startWithdrawFlow: (a: Asset, b: Asset, d: PoolDescriptor) => void;
  endWithdrawFlow: () => void;
  startWalletFlow: () => void;
  endWalletFlow: () => void;
  setWalletAddress: Dispatch<SetStateAction<string>>;
};

export const FlowContext = createContext<FlowContextType>({
  startDepositFlow: () => {},
  endDepositFlow: () => {},
  startWithdrawFlow: () => {},
  endWithdrawFlow: () => {},
  startWalletFlow: () => {},
  endWalletFlow: () => {},
  setWalletAddress: () => {},
});

export function useFlow() {
  return useContext(FlowContext);
}
export function FlowProvider({ children }: { children: ReactNode }) {
  const [showDepositFlow, setShowDepositFlow] = useState(false);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAInit, setTokenAInit] = useState<Asset | null>();
  const [tokenBInit, setTokenBInit] = useState<Asset | null>();
  const [poolDescriptor, setPoolDescriptor] = useState<PoolDescriptor | null>();

  const startDepositFlow = useCallback(
    (a, b, d) => {
      setTokenAInit(a);
      setTokenBInit(b);
      setPoolDescriptor(d);
      setShowDepositFlow(true);
    },
    [setTokenAInit, setTokenBInit, setPoolDescriptor, setShowDepositFlow]
  );

  const endDepositFlow = useCallback(
    () => setShowDepositFlow(false),
    [setShowDepositFlow]
  );

  const startWithdrawFlow = useCallback(
    (a, b, d) => {
      setTokenAInit(a);
      setTokenBInit(b);
      setPoolDescriptor(d);
      setShowWithdrawFlow(true);
    },
    [setTokenAInit, setTokenBInit, setPoolDescriptor, setShowWithdrawFlow]
  );

  const endWithdrawFlow = useCallback(
    () => setShowWithdrawFlow(false),
    [setShowWithdrawFlow]
  );

  const startWalletFlow = useCallback(
    () => setShowWalletModal(true),
    [setShowWalletModal]
  );

  const endWalletFlow = useCallback(
    () => setShowWalletModal(false),
    [setShowWalletModal]
  );

  const api = useMemo(
    () => ({
      startDepositFlow,
      endDepositFlow,
      startWithdrawFlow,
      endWithdrawFlow,
      startWalletFlow,
      endWalletFlow,
      setWalletAddress,
    }),
    [
      startDepositFlow,
      endDepositFlow,
      startWithdrawFlow,
      endWithdrawFlow,
      startWalletFlow,
      endWalletFlow,
      setWalletAddress,
    ]
  );

  return (
    <>
      <FlowContext.Provider value={api}>{children}</FlowContext.Provider>
      {showDepositFlow && tokenAInit && tokenBInit && poolDescriptor && (
        <DepositFlow
          tokenAInitAddress={tokenAInit.address}
          tokenBInitAddress={tokenBInit.address}
          poolDescriptor={poolDescriptor}
          onFlowEnd={endDepositFlow}
        />
      )}
      {showWithdrawFlow && tokenAInit && tokenBInit && poolDescriptor && (
        <WithdrawalFlow
          tokenAAsset={tokenAInit}
          tokenBAsset={tokenBInit}
          poolDescriptor={poolDescriptor}
          onFlowEnd={endWithdrawFlow}
        />
      )}
      <WalletModal
        open={showWalletModal}
        onClose={endWalletFlow}
        address={walletAddress}
      />
    </>
  );
}
