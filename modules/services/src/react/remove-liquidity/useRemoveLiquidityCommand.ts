import { HydraSDK, TokenAccount, AccountData } from "@hydraprotocol/sdk";
import { useCallback } from "react";
import { PoolDescriptor } from "../../services";

export function useRemoveLiquidityCommand(
  sdk: HydraSDK,
  poolDescriptor: PoolDescriptor,
  percent: bigint, // 10000 basis points
  lpTokenAssociatedAccount?: AccountData<TokenAccount>
) {
  return useCallback(async () => {
    if (!lpTokenAssociatedAccount?.account.data.amount) return;

    if (!poolDescriptor) return;

    const lpTokensToBurn =
      (percent * lpTokenAssociatedAccount?.account.data.amount) / 100_00n;

    const txHash = await sdk.liquidityPools.removeLiquidity(
      poolDescriptor.tokenXMint,
      poolDescriptor.tokenYMint,
      poolDescriptor.poolId,
      lpTokensToBurn
    );

    return txHash;
  }, [sdk, poolDescriptor, percent, lpTokenAssociatedAccount]);
}
