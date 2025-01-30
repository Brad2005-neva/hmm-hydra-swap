import PoolItem from "@components/poolItem";
import { TokenPrices } from "@types";
import PageMessage from "@ui/hydraPage/placeholder";
import LoaderSpinner from "@ui/loaderSpinner";
import { ReactNode } from "react";
import { PoolWithTokenAssets } from "./prepareViewModel";

export function PoolList({
  type,
  loading,
  pools,
  tokenPrices,
  message = "No pools available",
}: {
  type: "all" | "liquidity";
  loading: boolean;
  pools: PoolWithTokenAssets[];
  tokenPrices: TokenPrices;
  message?: ReactNode;
}) {
  if (loading) {
    return <LoaderSpinner />;
  }

  if (pools.length > 0) {
    return (
      <>
        {pools.map(({ poolDescriptor, tokenAInit, tokenBInit }) => {
          return (
            <PoolItem
              key={`${type}-${poolDescriptor.poolId}`}
              type={type}
              poolDescriptor={poolDescriptor}
              hasWithdraw={true}
              tokenAInit={tokenAInit}
              tokenBInit={tokenBInit}
              tokenPrices={tokenPrices}
            />
          );
        })}
      </>
    );
  }
  return <PageMessage message={message} />;
}
