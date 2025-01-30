import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { palette } from "@utils/palette";
import { ReactNode } from "react";

const useStyles = makeStyles({
  walletWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "24px",
    "& .wallet-adapter-button": {
      background: palette.gray.dark,
      borderRadius: "18px",
      height: "36px",
      fontSize: "13px",
      "& svg": {
        width: "24px",
        height: "24px",
        marginRight: "8px",
      },
    },
    "& .wallet-adapter-dropdown-list": {
      "& .wallet-adapter-dropdown-list-item": {
        padding: "0 15px",
        height: "32px",
        fontSize: "13px",
      },
    },
    "@media (max-width:600px)": {
      display: "none",
    },
  },
});

export const WalletWrapper = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.walletWrapper}>{children}</Box>;
};
