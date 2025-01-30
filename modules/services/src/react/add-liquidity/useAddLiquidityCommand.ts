import { HydraSDK } from "@hydraprotocol/sdk";
import { useCallback } from "react";
import { PoolDescriptor } from "../../services";

export function useAddLiquidityCommand(
  sdk: HydraSDK,
  poolDescriptor: PoolDescriptor,
  tokenXAmount: bigint,
  tokenYAmount: bigint,
  slippage: bigint
) {
  return useCallback(async () => {
    return await sdk.liquidityPools.addLiquidity(
      poolDescriptor.tokenXMint,
      poolDescriptor.tokenYMint,
      poolDescriptor.poolId,
      tokenXAmount,
      tokenYAmount,
      slippage
    );
  }, [sdk, poolDescriptor, tokenXAmount, tokenYAmount, slippage]);
}
