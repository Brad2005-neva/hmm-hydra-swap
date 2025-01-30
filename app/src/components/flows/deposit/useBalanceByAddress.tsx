import { useMemo } from "react";
import { useAssetBalances } from "@hydraprotocol/services";

export const useBalanceByAddress = (address: string): bigint => {
  const balances = useAssetBalances();

  return useMemo(() => {
    let tempAssetAmount = 0n;

    balances.forEach((assetBal) => {
      if (assetBal["address"] === address)
        tempAssetAmount = assetBal.balance ? assetBal.balance : 0n;
    });

    return tempAssetAmount;
  }, [balances, address]);
};
