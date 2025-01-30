import { FC, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { WalletName } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";

import { alpha, palette } from "@utils/palette";
import HydraButton from "../hydraButton";

const useStyles = makeStyles({
  installTitle: {
    color: `${palette.white} !important`,
    fontSize: "24px !important",
    lineHeight: "29px !important",
    textAlign: "center",
    marginBottom: "24px",
  },
  installWrapper: {
    borderTop: `1px solid ${palette.white}${alpha[5]}`,
    padding: "40px 3px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    "& > img": {
      width: "64px",
      height: "64px",
      marginBottom: "32px",
    },
    "& > .MuiButton-root": {
      marginBottom: "32px",
      width: "170px",
      "& p": {
        textTransform: "uppercase",
      },
    },
  },
  installGuide: {
    color: `${palette.white} !important`,
    textAlign: "center",
    maxWidth: "320px",
  },
  contentFooter: {
    display: "flex",
    justifyContent: "center",
    "& > span": {
      color: `${palette.white}${alpha[45]}`,
      fontSize: "14px",
      lineHeight: "17px",
      "&:last-of-type": {
        color: `${palette.white}${alpha[65]}`,
        cursor: "pointer",
        marginLeft: "6px",
      },
    },
  },
});

interface WalletNotDetectedViewProps {
  wallet: Wallet;
  select(walletName: WalletName): void;
}

export const WalletNotDetectedView: FC<WalletNotDetectedViewProps> = ({
  wallet,
  select,
}) => {
  const classes = useStyles();

  const handleWalletInstall = useCallback(() => {
    if (wallet && window) {
      window.open(wallet.adapter.url, "_blank");
      select("" as WalletName);
    }
  }, [wallet, select]);

  const resetWallet = useCallback(
    (_) => {
      select("" as WalletName);
    },
    [select]
  );

  return (
    <>
      <Typography className={classes.installTitle}>
        Wallet is not installed
      </Typography>
      <Box className={classes.installWrapper}>
        <img src={wallet.adapter.icon} alt="Wallet" />
        <HydraButton kind="primary" onClick={handleWalletInstall}>
          <Typography>Install</Typography>
        </HydraButton>
        <Typography className={classes.installGuide}>
          Make sure you only install their wallet from the{" "}
          {wallet.adapter.url.includes("chrome.google.com")
            ? "Google Chrome Web Store"
            : `official ${wallet.adapter.url} website`}
          .
        </Typography>
      </Box>
      <Box className={classes.contentFooter}>
        <span>Having trouble?</span> <span onClick={resetWallet}>Go back</span>
      </Box>
    </>
  );
};
