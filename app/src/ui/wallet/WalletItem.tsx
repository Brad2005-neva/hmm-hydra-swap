import { useCallback } from "react";
import { IconButton, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { palette, alpha } from "@utils/palette";
import { Check } from "../icons";
import { Adapter, WalletName } from "@solana/wallet-adapter-base";

const useStyles = makeStyles({
  itemWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: "6px",
    padding: "12px 16px",
    marginBottom: "16px",
    width: "100%",
    "& > img": {
      width: "32px",
      height: "32px",
      marginRight: "12px",
    },
    "& > p": {
      color: palette.white,
      lineHeight: "19px",
    },
    "& > svg": {
      fill: palette.purple.primary,
      marginLeft: "auto",
    },
    "& *": {
      position: "relative",
    },
    "&:last-of-type": {
      marginBottom: "0px",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: `${palette.white}${alpha[5]}`,
      borderRadius: "6px",
    },
    "&:hover": {
      background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
      "&::before": {
        top: "1px",
        right: "1px",
        bottom: "1px",
        left: "1px",
      },
    },
  },
});

export function WalletItem({
  adapter,
  onSelect,
  current,
}: {
  adapter: Adapter;
  onSelect(walletName: WalletName): void;
  current: Adapter | undefined;
}) {
  const classes = useStyles();

  const handleClick = useCallback(() => {
    onSelect(adapter.name);
  }, [adapter, onSelect]);

  return (
    <IconButton className={classes.itemWrapper} onClick={handleClick}>
      <img src={adapter.icon} alt="Wallet" />
      <Typography>{adapter.name}</Typography>
      {current?.name === adapter.name && <Check />}
    </IconButton>
  );
}
