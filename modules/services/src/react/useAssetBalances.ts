import { BalancesService } from "../services";
import { useObservable } from "./useObservable";

export function useAssetBalances(balancesService = BalancesService.instance()) {
  const [assetBalances, error] = useObservable(balancesService.balances, []);
  error && console.error(error);
  return assetBalances;
}
