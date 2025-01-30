import { FC, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { WalletName } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";

import { Hydraswap } from "../icons";
import { alpha, palette } from "@utils/palette";

const useStyles = makeStyles({
  connectTitle: {
    color: `${palette.white} !important`,
    fontSize: "24px !important",
    fontWeight: "500",
    lineHeight: "29px !important",
    textAlign: "center",
    marginBottom: "5px",
  },
  connectSubTitle: {
    color: `${palette.white} !important`,
    lineHeight: "19px !important",
    textAlign: "center",
    marginBottom: "24px",
  },
  connectWrapper: {
    borderTop: `1px solid ${palette.white}${alpha[5]}`,
    padding: "0 3px",
  },
  connectContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "100px 0",
    "& > img": {
      width: "72px",
      height: "72px",
    },
    "& > svg": {
      width: "72px",
      height: "72px",
    },
  },
  connectBridge: {
    color: `${palette.white}${alpha[85]}`,
    fontSize: "24px",
    lineHeight: "29px",
    margin: "0 40px",
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

interface WalletConnectingViewProps {
  wallet: Wallet;
  select(walletName: WalletName): void;
}

export const WalletConnectingView: FC<WalletConnectingViewProps> = ({
  wallet,
  select,
}) => {
  const classes = useStyles();

  const resetWallet = useCallback(() => {
    select("" as WalletName);
  }, [select]);

  return (
    <>
      <Typography className={classes.connectTitle}>Connecting</Typography>
      <Typography className={classes.connectSubTitle}>
        Please unlock your {wallet.adapter.name} wallet
      </Typography>
      <Box className={classes.connectWrapper}>
        <Box className={classes.connectContent}>
          <img src={wallet.adapter.icon} alt="Wallet" />
          <span className={classes.connectBridge}>......</span>
          <Hydraswap />
        </Box>
      </Box>
      <Box className={classes.contentFooter}>
        <span>Having trouble?</span> <span onClick={resetWallet}>Go back</span>
      </Box>
    </>
  );
};
