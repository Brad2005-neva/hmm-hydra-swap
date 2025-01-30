import { useCallback, useEffect } from "react";
import { Decimal, HydraSDK } from "@hydraprotocol/sdk";
import { useToken } from "../useToken";
import { useGetDirection } from "../swap/useGetDirection";
import { EnrichedPoolState } from "../../services";

// take the selected pool and token form data
// set the appropriate fields based on user input
// calculating swap estimates
export function useCalculateLiquidityResult(
  client: HydraSDK,
  pool: EnrichedPoolState,
  tokenFrom: ReturnType<typeof useToken>,
  tokenTo: ReturnType<typeof useToken>,
  focus: "from" | "to",
  setFee?: (value: bigint) => void
) {
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

  const calculateDeposit = useCallback(
    async (amount: bigint, direction?: "xy" | "yx") => {
      if (
        !tokenXMint ||
        !tokenYMint ||
        !tokenXVault ||
        !tokenYVault ||
        !poolState
      )
        return { amount: 0n };

      if (!direction) throw new Error("Asset is not part of pool mints");

      const tokenXDecimals = BigInt(tokenXMint.account.data.decimals);
      const tokenYDecimals = BigInt(tokenYMint.account.data.decimals);

      const decimalX = Decimal.fromVaultAndMint(tokenXVault, tokenXMint);

      const decimalY = Decimal.fromVaultAndMint(tokenYVault, tokenYMint);

      if (decimalY.eq(Decimal.ZERO) || decimalX.eq(Decimal.ZERO)) return null;

      const amountX = !decimalY.eq(Decimal.ZERO)
        ? decimalX
            .div(decimalY)
            .mul(Decimal.from(amount))
            .unscale(tokenXDecimals - tokenYDecimals)
        : 0n;

      const amountY = !decimalX.eq(Decimal.ZERO)
        ? decimalY
            .div(decimalX)
            .mul(Decimal.from(amount))
            .unscale(tokenYDecimals - tokenXDecimals)
        : 0n;

      const out = {
        amount: direction === "xy" ? amountY : amountX,
      };
      return out;
    },
    [tokenXMint, tokenYMint, tokenXVault, tokenYVault, poolState]
  );

  useEffect(() => {
    if (focus === "from") {
      if (!tokenFrom.asset) return;
      calculateDeposit(tokenFrom.amount, tokenFromDirection).then((result) => {
        if (result) tokenTo.setAmount(result.amount);
      });
    }
    if (focus === "to") {
      if (!tokenTo.asset) return;
      calculateDeposit(tokenTo.amount, tokenToDirection).then((result) => {
        if (result) tokenFrom.setAmount(result.amount);
      });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    // deliberately ignoring tokenTo and
    // tokenFrom changes to avoid re-rendering
    calculateDeposit,
    tokenFrom.asset,
    tokenFrom.amount,
    tokenTo.asset,
    tokenTo.amount,
    setFee,
  ]);
}
