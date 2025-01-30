import { Decimal } from "@hydraprotocol/sdk";
import { ReactNode } from "react";
import { InfoCell } from "../hydraPage/poolCell";
import PoolLiquiditySkeleton from "../poolLiquiditySkeleton";

type PoolListingProps = {
  lpTokenMintDecimals: number;
  lpTokenSupply: Decimal;
  lpTVLInUSD: Decimal;
  title: ReactNode;
  lpMintLoaded: boolean;
};
export function PoolListing({
  lpTokenMintDecimals,
  lpTokenSupply,
  lpTVLInUSD,
  title,
  lpMintLoaded,
}: PoolListingProps) {
  const tvl = lpTVLInUSD.toFormat(Decimal.FORMAT_TOKEN, 0);
  const roundedDecimals =
    lpTokenSupply.toNumber() > 8000 ? 0 : lpTokenMintDecimals;
  const supply = lpTokenSupply.toFormat(Decimal.FORMAT_TOKEN, roundedDecimals);

  return (
    <>
      {title}
      <InfoCell align="left" title="Total Liquidity">
        {lpMintLoaded ? (
          <>
            ${tvl}
            <span>{supply} LP Tokens</span>
          </>
        ) : (
          <PoolLiquiditySkeleton />
        )}
      </InfoCell>
    </>
  );
}
