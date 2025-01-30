import { Box, Typography, Link } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Asset } from "@hydraprotocol/sdk";
import { useNetworkProvider } from "@hydraprotocol/services";

import { View } from "../../../icons";
import HYSD from "@assets/images/symbols/hysd.png";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  assetsContainer: {
    display: "flex",
    alignItems: "center",
    width: "250px",
    "& span": {
      color: palette.white,
      fontSize: "20px",
      lineHeight: "24px",
      margin: "0 3px 0 12px",
    },
    "& p": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "13px",
      lineHeight: "16px",
      margin: "4px 3px 0 12px",
    },
    "& a": {
      height: "20px",
      padding: "8px",
    },
    "& svg": {
      fill: `${palette.white}${alpha[45]}`,
      width: "20px",
      height: "20px",
    },
    "@media (max-width: 600px)": {
      borderBottom: `1px solid ${palette.white}${alpha[5]}`,
      marginBottom: "12px",
      width: "100%",
    },
  },
  assetsLogo: {
    width: "51px",
    height: "32px",
    position: "relative",
  },
  logoWrapper: {
    position: "absolute",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: palette.darkBlue.primary,
    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
      borderRadius: "50%",
    },
    "&:last-of-type": {
      right: 0,
    },
  },
});

function TitleCell({
  tokenA,
  tokenB,
  address,
}: {
  tokenA: Asset;
  tokenB: Asset;
  address: string;
}) {
  const classes = useStyles();

  const { meta } = useNetworkProvider();

  return (
    <Box className={classes.assetsContainer}>
      <Box className={classes.assetsLogo}>
        <Box className={classes.logoWrapper}>
          <img
            src={tokenA.symbol.includes("HYD") ? HYSD : tokenA.logoURI}
            alt="Coin"
          />
        </Box>
        <Box className={classes.logoWrapper}>
          <img
            src={tokenB.symbol.includes("HYD") ? HYSD : tokenB.logoURI}
            alt="Coin"
          />
        </Box>
      </Box>
      <Typography variant="caption">{`${tokenA.symbol}-${tokenB.symbol}`}</Typography>
      <Link
        href={`https://explorer.solana.com/address/${address}?cluster=${
          meta.network === "localnet" ? "custom" : meta.network
        }`}
        target="_blank"
      >
        <View />
      </Link>
    </Box>
  );
}

export default TitleCell;
