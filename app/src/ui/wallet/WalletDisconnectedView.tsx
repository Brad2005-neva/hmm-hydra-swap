import { FC, useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";

import { WalletItem } from "./WalletItem";
import { palette } from "@utils/palette";
import { Wallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";

const useStyles = makeStyles({
  selectTitle: {
    color: `${palette.white} !important`,
    fontSize: "18px !important",
    fontWeight: "500",
    lineHeight: "22px !important",
    marginBottom: "4px",
  },
  selectSubTitle: {
    color: `${palette.white} !important`,
    opacity: "0.6",
  },
  walletList: {
    display: "flex",
    flexDirection: "column",
    marginTop: "24px",
  },
});

interface WalletDisconnectedViewProps {
  wallets: Wallet[];
  select(walletName: WalletName): void;
}

export const WalletDisconnectedView: FC<WalletDisconnectedViewProps> = ({
  wallets,
  select,
}) => {
  const classes = useStyles();

  const onSelect = useCallback(
    (walletName: WalletName) => {
      select(walletName);
    },
    [select]
  );

  return (
    <>
      <Typography className={classes.selectTitle}>Select a Wallet</Typography>
      <Typography className={classes.selectSubTitle}>
        Please select a wallet to connect to this dapp:
      </Typography>
      <Box className={classes.walletList}>
        {wallets.map((eachWallet, index) => (
          <WalletItem
            key={index}
            adapter={eachWallet.adapter}
            onSelect={onSelect}
            current={undefined}
          />
        ))}
      </Box>
    </>
  );
};
