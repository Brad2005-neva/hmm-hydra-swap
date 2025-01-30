import { FC, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Link, Typography } from "@mui/material";
import { Wallet } from "@solana/wallet-adapter-react";

import { alpha, palette } from "@utils/palette";
import HydraButton from "../hydraButton";
import { WalletIcon } from "./WalletIcon";
import { Copy, ExternalLink } from "../icons";
import { normalizeAddress } from "@utils/normalize";
import { NetworkMeta } from "@hydraprotocol/sdk";

const useStyles = makeStyles({
  accountTitle: {
    color: `${palette.white} !important`,
    fontSize: "24px !important",
    fontWeight: "500",
    lineHeight: "29px !important",
    marginBottom: "5px",
    textAlign: "center",
  },
  accountSubTitle: {
    color: `${palette.white}${alpha[65]}`,
    lineHeight: "19px !important",
    textAlign: "center",
    marginBottom: "24px",
  },
  accountWrapper: {
    borderTop: `1px solid ${palette.white}${alpha[5]}`,
    padding: "32px 3px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  accountAddress: {
    color: `${palette.white} !important`,
    fontSize: "24px !important",
    lineHeight: "29px !important",
  },
  accountLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: "20px",
    width: "100%",
    "& .MuiLink-root": {
      color: `${palette.white}${alpha[65]}`,
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      "& > span": {
        fontSize: "14px",
        lineHeight: "17px",
        marginRight: "6px",
      },
      "& > svg": {
        background: palette.darkBlue.primary,
        borderRadius: "50%",
        padding: "4.5px",
        width: "15px",
        height: "15px",
      },
    },
  },
  accountActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "20px",
    width: "100%",
    "& .MuiButton-root": {
      width: "calc(50% - 8px)",
      "& p": {
        fontWeight: 500,
      },
    },
  },
});

interface WalletConnectedViewProps {
  address: string;
  wallet: Wallet;
  meta: NetworkMeta;
  setChangeWallet(state: boolean): void;
  disconnectWallet(): void;
  copyAddress(): void;
}

export const WalletConnectedView: FC<WalletConnectedViewProps> = ({
  address,
  wallet,
  meta,
  copyAddress,
  setChangeWallet,
  disconnectWallet,
}) => {
  const classes = useStyles();

  const onCopy = useCallback(() => {
    copyAddress();
  }, [copyAddress]);

  const onDisconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  const changeWallet = useCallback(() => {
    setChangeWallet(true);
  }, [setChangeWallet]);

  return (
    <>
      <Typography className={classes.accountTitle}>Account</Typography>
      <Typography className={classes.accountSubTitle}>
        Connected with {wallet.adapter.name}
      </Typography>
      <Box className={classes.accountWrapper}>
        <WalletIcon address={address} />
        <Typography className={classes.accountAddress}>
          {normalizeAddress(address)}
        </Typography>
        <Box className={classes.accountLinks}>
          <Link component="button" onClick={onCopy}>
            <span>Copy Address</span> <Copy />
          </Link>
          <Link
            href={`https://explorer.solana.com/address/${address}?cluster=${
              meta.network === "localnet" ? "custom" : meta.network
            }`}
            target="_blank"
          >
            <span>View on explorer</span> <ExternalLink />
          </Link>
        </Box>
        <Box className={classes.accountActions}>
          <HydraButton kind="secondary" onClick={onDisconnect}>
            <Typography>Disconnect</Typography>
          </HydraButton>
          <HydraButton kind="secondary" onClick={changeWallet}>
            <Typography>Change wallet</Typography>
          </HydraButton>
        </Box>
      </Box>
    </>
  );
};
