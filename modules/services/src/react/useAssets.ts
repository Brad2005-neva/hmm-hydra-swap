import { AssetMap, AssetsService } from "../services";
import { useObservable } from "./useObservable";

export function useAssets(assetService = AssetsService.instance()) {
  const [keys, error] = useObservable(
    assetService.assetMap,
    new Map() as AssetMap
  );
  error && console.error(error);
  return keys;
}
