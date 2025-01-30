import { FC, useCallback } from "react";
import { IconButton, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { alpha, palette } from "@utils/palette";
import { User } from "../icons";
import { normalizeAddress } from "@utils/normalize";

const useStyles = makeStyles({
  walletButton: {
    backgroundColor: palette.gray.dark,
    borderRadius: "6px",
    padding: "14px 12px",
    "& > svg": {
      position: "relative",
      width: "21px",
      height: "23px",
      fill: `${palette.white}${alpha[85]}`,
    },
    "& > p": {
      position: "relative",
      color: `${palette.white}${alpha[85]}`,
      lineHeight: "19px",
      marginLeft: "17px",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
      borderRadius: "6px",
      background: palette.darkBlue.secondary,
    },
    "&:hover": {
      background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    },
    "@media (max-width: 600px)": {
      padding: "7px 8px",
      "& > svg": {
        width: "16px",
        height: "18px",
      },
      "& > p": {
        fontSize: "14px",
        lineHeight: "20px",
      },
    },
  },
});

interface ChangeWalletButtonProps {
  address: string;
  isMobile: boolean | undefined;
  onClick: () => void;
}

export const ChangeWalletButton: FC<ChangeWalletButtonProps> = ({
  address,
  isMobile,
  onClick,
}) => {
  const classes = useStyles();

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <IconButton
      aria-label="change wallet"
      className={classes.walletButton}
      onClick={handleClick}
    >
      <User />
      {!isMobile && <Typography>{normalizeAddress(address)}</Typography>}
    </IconButton>
  );
};
