import { useMemo } from "react";
import { PoolService } from "../services";
import { useObservable } from "./useObservable";

export function usePools(poolService = PoolService.instance()) {
  const allPools$ = useMemo(() => poolService.getAllPools(), [poolService]);
  const [keys, error, loading] = useObservable(allPools$, []);
  error && console.error(error);
  return { keys, loading };
}
