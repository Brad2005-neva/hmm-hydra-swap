import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { EMPTY, Observable } from "rxjs";
import { EnrichedPoolState, PoolDescriptor } from "../services";
import { PoolService } from "../services";
import { useObservable } from "./useObservable";

type UsePoolStateFromStreamType = {
  value: EnrichedPoolState;
  loading: boolean;
};

export function usePoolStateFromStream(
  // A or B = unsorted mints
  poolStream$: Observable<EnrichedPoolState>
) {
  const [value, , loading] = useObservable(poolStream$, {
    poolState: undefined,
    tokenXVault: undefined,
    tokenYVault: undefined,
    tokenXMint: undefined,
    tokenYMint: undefined,
    lpTokenMint: undefined,
    lpTokenAssociatedAccount: undefined,
    isInitialized: false,
  });
  return { value, loading };
}

export function usePoolStateFromDescriptor(
  poolDescriptor?: PoolDescriptor,
  poolService = PoolService.instance()
): UsePoolStateFromStreamType {
  const poolStream$ = usePoolStreamFromDescriptor(poolDescriptor, poolService);
  return usePoolStateFromStream(poolStream$);
}

export function usePoolStateFromSearch(
  tokenAMintKey?: PublicKey,
  tokenBMintKey?: PublicKey,
  poolService = PoolService.instance()
): UsePoolStateFromStreamType {
  const poolStream$ = usePoolStreamFromSearch(
    tokenAMintKey,
    tokenBMintKey,
    poolService
  );

  return usePoolStateFromStream(poolStream$);
}

export function usePoolStreamFromDescriptor(
  poolDescriptor?: PoolDescriptor,
  poolService = PoolService.instance()
) {
  return useMemo(() => {
    if (typeof poolDescriptor === "undefined") return EMPTY;
    return poolService.getPool(poolDescriptor);
  }, [poolDescriptor, poolService]);
}

export function usePoolStreamFromSearch(
  tokenAMintKey?: PublicKey,
  tokenBMintKey?: PublicKey,
  poolService = PoolService.instance()
) {
  return useMemo(() => {
    if (!tokenAMintKey || !tokenBMintKey) return EMPTY;

    return poolService.findPool({
      tokenA: tokenAMintKey,
      tokenB: tokenBMintKey,
    });
  }, [poolService, tokenAMintKey, tokenBMintKey]);
}
