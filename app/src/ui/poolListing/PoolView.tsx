import { ReactNode } from "react";
import { Box } from "@mui/material";
import { Asset } from "@hydraprotocol/sdk";
import cn from "classnames";
import PoolBadge from "../hydraPage/poolBadge";
import { makeStyles } from "@mui/styles";
import { palette } from "@utils/palette";

export const useStyles = makeStyles({
  poolContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    marginTop: "17px",
  },
  poolWrapper: {
    background: palette.darkBlue.primary,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    flexWrap: "wrap",
    padding: "12px 0 12px 24px",
    marginBottom: "20px",
    "& > div": {
      padding: "12px 24px 12px 0",
      "&:first-of-type": {
        paddingLeft: 0,
      },
    },
    "&.alignTop": {
      alignItems: "flex-start",
    },
    "@media (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "12px 16px",
      "&.hasDoubleDip": {
        paddingTop: "48px",
      },
      "& > div": {
        padding: "12px 0",
        "&:first-of-type": {
          paddingLeft: "16px",
        },
      },
    },
  },
});
export function PoolView({
  cValue,
  type,
  tokenAInit,
  tokenBInit,
  children,
}: {
  cValue: number | undefined;
  type: string | undefined;
  tokenAInit: Asset;
  tokenBInit: Asset;
  children: ReactNode;
}) {
  const classes = useStyles();

  return (
    <Box className={classes.poolContainer} aria-label="Pool Listing">
      {Number(cValue) > 0 && (
        <PoolBadge name="HMM" type="hmm" cValue={cValue ? cValue / 100 : 0} />
      )}
      <Box
        className={cn(classes.poolWrapper, {
          alignTop: type === "liquidity",
        })}
        aria-label={`Pool ${tokenAInit.symbol}-${tokenBInit.symbol}`}
      >
        {children}
      </Box>
    </Box>
  );
}
