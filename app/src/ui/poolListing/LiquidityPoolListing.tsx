import { Box } from "@mui/material";
import { Decimal } from "@hydraprotocol/sdk";
import { InfoCell } from "../hydraPage/poolCell";
import { makeStyles } from "@mui/styles";
import { palette, alpha } from "@utils/palette";
import { ReactNode } from "react";
import PoolLiquiditySkeleton from "../poolLiquiditySkeleton";

export const useStyles = makeStyles({
  poolContent: {
    display: "flex",
    flexDirection: "column",
    "@media (max-width: 600px)": {
      width: "100%",
      "& > div:first-of-type": {
        paddingBottom: "12px",
        width: "100% !important",
      },
    },
  },
  poolDetail: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: "16px",
    "@media (max-width: 600px)": {
      flexDirection: "column",
      marginTop: 0,
    },
  },
  liquidityDetail: {
    display: "flex",
    flexDirection: "column",
    width: "400px",
    "& > p": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "14px",
      lineHeight: "17px",
      "& span": {
        color: palette.white,
      },
    },
    "@media (max-width: 600px)": {
      width: "100%",
      marginTop: "12px",
    },
  },
  poolTerms: {
    display: "flex",
    "@media (max-width: 600px)": {
      order: -1,
      flexDirection: "column",
      borderBottom: `1px solid ${palette.white}${alpha[5]}`,
    },
  },
});

type LiquidityPoolListingProps = {
  lpTokenBalanceInUSD: Decimal;
  lpTokenBalance: Decimal;
  lpTokenDecimals: number;
  sharePercent: Decimal;
  title: ReactNode;
  lpMintLoaded: boolean;
};

export function LiquidityPoolListing({
  lpTokenBalanceInUSD,
  lpTokenBalance,
  lpTokenDecimals,
  sharePercent,
  title,
  lpMintLoaded,
}: LiquidityPoolListingProps) {
  const classes = useStyles();

  const tokens = lpTokenBalance.toFormat(Decimal.FORMAT_TOKEN, lpTokenDecimals);
  const tokensInUSD = lpTokenBalanceInUSD.toFormat(Decimal.FORMAT_DOLLAR);
  const share =
    sharePercent.toNumber() < 0.01
      ? "<0.01"
      : sharePercent.toFormat(Decimal.FORMAT_PERCENT);

  return (
    <>
      <Box className={classes.poolContent}>
        {title}
        <Box className={classes.poolDetail}>
          <Box className={classes.liquidityDetail}>
            <InfoCell align="left" title="Your Liquidity">
              {lpMintLoaded ? (
                <>
                  ${tokensInUSD}
                  <span>{`${tokens} LP Token`}</span>
                </>
              ) : (
                <PoolLiquiditySkeleton />
              )}
            </InfoCell>
          </Box>
          <Box className={classes.poolTerms}>
            <InfoCell align="left" title="Your Share">
              {`${share} %`}
            </InfoCell>
          </Box>
        </Box>
      </Box>
    </>
  );
}
