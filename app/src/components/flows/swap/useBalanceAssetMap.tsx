import { useMemo } from "react";
import { useAssetBalances } from "@hydraprotocol/services";

import { AssetBalance } from "@types";

export const useBalanceAssetMap = () => {
  const balances = useAssetBalances();

  return useMemo(() => {
    const tempBalances: AssetBalance = new Map();

    balances.forEach((balance) => {
      tempBalances.set(balance["address"], balance.balance || 0n);
    });

    return tempBalances;
  }, [balances]);
};
