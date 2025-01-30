import { useMemo } from "react";
import { PoolService } from "../services";
import { useObservable } from "./useObservable";

export function useMyPools(poolService = PoolService.instance()) {
  const myPools$ = useMemo(() => poolService.getMyPools(), [poolService]);
  const [keys, error, loading] = useObservable(myPools$, []);
  error && console.error(error);
  return { keys, loading };
}
