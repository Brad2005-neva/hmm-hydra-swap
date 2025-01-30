import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { HydraSDK } from "@hydraprotocol/sdk";
import React, { useMemo } from "react";
import { useContext } from "react";
import { useNetworkProvider } from "./HydraNetworkProvider";
import { ClientService } from "../services";
export const HydraClientContext = React.createContext({} as HydraSDK);

// TODO: This might be good to think about as deprecated. Should be using service injection instead.
export function HydraClientProvider({
  children,
  clientService = ClientService.instance(),
}: {
  children: React.ReactNode;
  clientService?: ClientService;
}) {
  const { network } = useNetworkProvider();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const client = useMemo(() => {
    const client = HydraSDK.create(network, connection, wallet);
    clientService.setClient(client);
    return client;
  }, [connection, network, wallet, clientService]);

  return (
    <HydraClientContext.Provider value={client}>
      {children}
    </HydraClientContext.Provider>
  );
}

export function useHydraClient() {
  return useContext(HydraClientContext);
}
