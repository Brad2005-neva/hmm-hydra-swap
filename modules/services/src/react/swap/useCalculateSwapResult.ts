import { useEffect, useMemo } from "react";
import { LiquidityPoolsCalculator, Log } from "@hydraprotocol/sdk";
import { useToken } from "../useToken";
import { useGetDirection } from "./useGetDirection";
import { EnrichedPoolState } from "../../services";
import { useOraclePrices } from "../..";
import { calculateFeesAndSwap } from "./calculateFeesAndSwap";

// take the selected pool and token form data
// set the appropriate fields based on user input
// calculating swap estimates
export function useCalculateSwapResult(
  log: Log,
  pool: EnrichedPoolState,
  tokenFrom: ReturnType<typeof useToken>,
  tokenTo: ReturnType<typeof useToken>,
  focus: "from" | "to",
  setFee?: (value: bigint) => void
) {
  const { data: tokenPrices } = useOraclePrices();

  const { tokenXMint, tokenYMint, tokenXVault, tokenYVault, poolState } = pool;

  const tokenFromDirection = useGetDirection(
    tokenXMint,
    tokenYMint,
    tokenFrom.asset?.address
  );

  const tokenToDirection = useGetDirection(
    tokenXMint,
    tokenYMint,
    tokenTo.asset?.address
  );

  const calculator = useMemo(() => {
    return LiquidityPoolsCalculator.create();
  }, []);

  useEffect(() => {
    if (focus === "from") {
      if (!tokenFrom.asset) return;

      calculateFeesAndSwap(
        calculator,
        tokenFrom.amount,
        tokenXMint,
        tokenYMint,
        tokenXVault,
        tokenYVault,
        poolState,
        tokenFrom.asset,
        tokenTo.asset,
        tokenPrices,
        log,
        tokenFromDirection
      ).then((result) => {
        tokenTo.setAmount(result.amount);
        setFee && setFee(result.fees);
      });
    }
    if (focus === "to") {
      if (!tokenTo.asset) return;

      calculateFeesAndSwap(
        calculator,
        tokenTo.amount,
        tokenXMint,
        tokenYMint,
        tokenXVault,
        tokenYVault,
        poolState,
        tokenFrom.asset,
        tokenTo.asset,
        tokenPrices,
        log,
        tokenToDirection
      ).then((result) => {
        tokenFrom.setAmount(result.amount);
        setFee && setFee(result.fees);
      });
    }
  }, [
    tokenFrom.asset,
    tokenFrom.amount,
    tokenTo.asset,
    tokenTo.amount,
    setFee,
    poolState,
    focus,
    tokenFrom,
    calculator,
    tokenXMint,
    tokenYMint,
    tokenXVault,
    tokenYVault,
    tokenTo,
    tokenPrices,
    log,
    tokenFromDirection,
    tokenToDirection,
  ]);
}
