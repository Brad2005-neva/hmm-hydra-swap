import { useCallback } from "react";
import { TokenField } from "../useToken";
import { PoolDescriptor } from "../../services/types";
import { HydraSDK } from "@hydraprotocol/sdk";

export function useSwapCommand(
  sdk: HydraSDK,
  tokenFrom: TokenField,
  tokenTo: TokenField,
  minimumAmountOut: bigint,
  poolDescriptor?: PoolDescriptor
) {
  return useCallback(async () => {
    if (!tokenFrom.mint || !tokenTo.mint || !poolDescriptor) return;

    const tokenFromAccount = await sdk.accountLoaders
      .associatedToken(tokenFrom.mint)
      .key();

    const tokenToAccount = await sdk.accountLoaders
      .associatedToken(tokenTo.mint)
      .key();

    const { amount } = tokenFrom;

    const txHash = await sdk.liquidityPools.swap(
      poolDescriptor.tokenXMint,
      poolDescriptor.tokenYMint,
      poolDescriptor.poolId,
      tokenFromAccount,
      tokenToAccount,
      amount,
      minimumAmountOut
    );

    return txHash;
  }, [sdk, tokenFrom, tokenTo, minimumAmountOut, poolDescriptor]);
}
