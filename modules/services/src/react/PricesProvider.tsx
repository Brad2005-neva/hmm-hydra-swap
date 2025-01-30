import React, { useMemo } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useNetworkProvider } from "./HydraNetworkProvider";
import { PricesService } from "../services";

export const PricesContext = React.createContext<{
  data?: {
    oracle: Record<string, number>;
    rest: Record<string, number>;
  };
  isLoading: boolean;
}>({ isLoading: false });

export function PricesProvider({
  children,
  pricesService = PricesService.new(),
}: {
  children: React.ReactNode;
  pricesService?: PricesService;
}) {
  const { network } = useNetworkProvider();
  const { data, isLoading } = useQuery("fetchPythPrices", async () =>
    pricesService.fetchPrices(network)
  );

  const result = useMemo(() => ({ data, isLoading }), [data, isLoading]);

  return (
    <PricesContext.Provider value={result}>{children}</PricesContext.Provider>
  );
}

export function useOraclePrices() {
  return useContext(PricesContext);
}
