import React from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { getNetworkMeta, Network, NetworkMeta } from "@hydraprotocol/sdk";
import { NetworkService } from "../services/network";

export type NetworkApi = {
  network: Network;
  meta: NetworkMeta;
  setNetwork: (n: Network) => void;
  endpoint: string;
  networks: NetworkMeta[];
  mainnetMode: boolean;
};

// Config
function createNetworkApi(
  networkService = NetworkService.instance(),
  setNetwork: (n: Network) => void = () => {}
): NetworkApi {
  networkService.resetIfQueryParam();
  const network = networkService.getNetwork();
  const meta = getNetworkMeta(network);
  const endpoint = meta?.endpoint;
  const networks = networkService.getNetworks();
  const mainnetMode = networkService.isMainnetMode();
  return {
    network,
    meta,
    setNetwork,
    endpoint,
    networks,
    mainnetMode,
  };
}

const defaultApi = createNetworkApi();

export const NetworkProviderContext =
  React.createContext<NetworkApi>(defaultApi);

export function HydraNetworkProvider({
  children,
  networkService = NetworkService.instance(),
}: {
  children: React.ReactNode;
  defaultNetwork?: Network;
  networkService?: NetworkService;
}) {
  const handleNetworkSelected = React.useCallback(
    (newNetwork: Network) => {
      networkService.setNetwork(newNetwork);
    },
    [networkService]
  );

  const currentNetwork = React.useMemo(
    () => createNetworkApi(networkService, handleNetworkSelected),
    [networkService, handleNetworkSelected]
  );

  return (
    <NetworkProviderContext.Provider value={currentNetwork}>
      <ConnectionProvider endpoint={currentNetwork.meta.endpoint}>
        {children}
      </ConnectionProvider>
    </NetworkProviderContext.Provider>
  );
}

export function useNetworkProvider() {
  return React.useContext(NetworkProviderContext);
}
