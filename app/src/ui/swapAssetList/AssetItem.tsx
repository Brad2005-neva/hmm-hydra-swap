import { FC, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, IconButton } from "@mui/material";
import { Asset, Decimal, Network } from "@hydraprotocol/sdk";

import { AssetBalance } from "@types";
import HYSD from "@assets/images/symbols/hysd.png";
import { palette, alpha } from "@utils/palette";
import { View } from "../icons";

const useStyles = makeStyles({
  assetItem: {
    borderRadius: "0",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: "16px 0",
    fontSize: "16px",
    justifyContent: "flex-start",
    textAlign: "left",
    width: "100%",
    "&:hover": {
      background: `${palette.black}${alpha[5]}`,
    },
  },
  buttonImgWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    marginRight: "8px",
    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
  assetSymbol: {
    color: `${palette.white}${alpha[85]}`,
    lineHeight: "19px",
  },
  assetExplore: {
    color: `${palette.white}${alpha[85]}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "4px",
    padding: "4px",
    "& svg": {
      width: "19px",
      height: "19px",
    },
  },
  assetBalance: {
    color: palette.white,
    fontWeight: "500",
    lineHeight: "20px",
    flexGrow: 1,
    textAlign: "right",
  },
});

interface AssetItemProps {
  asset: Asset;
  onClick(asset: Asset): void;
  balances: AssetBalance;
  network?: Network;
}

export const AssetItem: FC<AssetItemProps> = ({
  asset,
  onClick,
  balances,
  network,
}) => {
  const classes = useStyles();

  const handleAssetClicked = useCallback(() => {
    onClick(asset);
  }, [onClick, asset]);

  const handleExploreAssetClicked = useCallback(
    (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event.stopPropagation();
      const link = `https://explorer.solana.com/address/${
        asset.address
      }?cluster=${network === "localnet" ? "custom" : network}`;
      window.open(link, "_blank");
    },
    [network, asset.address]
  );

  return (
    <Box
      aria-label={`Select ${asset.symbol}`}
      className={classes.assetItem}
      onClick={handleAssetClicked}
    >
      <span className={classes.buttonImgWrapper}>
        <img
          src={asset.symbol.includes("HYD") ? HYSD : asset.logoURI}
          alt="asset.symbol"
        />
      </span>
      <span className={classes.assetSymbol}>{asset.symbol}</span>
      <IconButton
        className={classes.assetExplore}
        title={`Open "${asset.name}" in explorer`}
        onClick={handleExploreAssetClicked}
      >
        <View />
      </IconButton>
      <span
        className={classes.assetBalance}
        aria-label={`Token ${asset.symbol} Balance`}
      >
        {Decimal.fromAmountAndAsset(
          balances.get(asset.address) ?? 0n,
          asset
        ).toFormat(Decimal.FORMAT_TOKEN, asset?.decimals)}
      </span>
    </Box>
  );
};
