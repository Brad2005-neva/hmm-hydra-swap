import { AccountData } from "@hydraprotocol/sdk";
import { useMemo } from "react";
import { Observable } from "rxjs";
import { useHydraClient } from "./HydraClientProvider";
import { PoolDescriptor } from "../services";
import { useObservable } from "./useObservable";

export function useLoaderFinder(poolDescriptor: PoolDescriptor) {
  const client = useHydraClient();
  return useMemo(() => {
    const { poolId, tokenXMint, tokenYMint } = poolDescriptor;
    return client.liquidityPools.accounts.getLoaderFinder(
      tokenXMint,
      tokenYMint,
      poolId
    );
  }, [client, poolDescriptor]);
}

export function useLoaderStream<T>(
  loader: () => {
    stream(): Observable<AccountData<T> | undefined>;
  }
) {
  const stream = loader().stream();
  return useObservable(
    useMemo(() => stream, [stream]),
    undefined
  )[0];
}
