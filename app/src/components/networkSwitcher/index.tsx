import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useNetworkProvider } from "@hydraprotocol/services";
import { Network } from "@hydraprotocol/sdk";
import { HydraModal } from "@ui/hydraModal";
import {
  NetworkSwitcherButton,
  NetworkSwitcherPanel,
} from "@ui/networkSwitcher";

const NetworkSwitcherContext = React.createContext({
  launch() {},
});

export function useNetworkSwitcher() {
  return useContext(NetworkSwitcherContext);
}

export function NetworkSwitcherProvider({ children }: { children: ReactNode }) {
  const [openRPCModal, setOpenRPCModal] = useState(false);
  const { meta, setNetwork, networks } = useNetworkProvider();

  const launch = useCallback(() => {
    setOpenRPCModal(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpenRPCModal(false);
  }, []);

  const handleNetworkChanged = useCallback(
    (network: Network) => {
      setNetwork(network);
      setOpenRPCModal(false);
    },
    [setNetwork]
  );

  const api = useMemo(
    () => ({
      launch,
    }),
    [launch]
  );

  return (
    <>
      <NetworkSwitcherContext.Provider value={api}>
        {children}
      </NetworkSwitcherContext.Provider>
      <HydraModal
        open={openRPCModal}
        onClose={handleClose}
        title="Select Environment"
        mainContent={
          <NetworkSwitcherPanel>
            {networks.map(({ network, name }, index) => (
              <NetworkSwitcherButton
                key={index}
                name={name}
                network={network}
                onClick={handleNetworkChanged}
                showCheck={meta.network === network}
              />
            ))}
          </NetworkSwitcherPanel>
        }
      />
    </>
  );
}
