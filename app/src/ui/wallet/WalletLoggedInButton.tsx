import { FC, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Wallet as WalletSVG, Connection } from "../icons";
import HydraButton from "../hydraButton";

const useStyles = makeStyles({
  connectWrapper: {
    "& > .MuiButton-root": {
      "& > svg": {
        width: "initial",
        height: "initial",
        marginRight: "8px",
      },
    },
  },
});

interface LoggedInWalletButtonProps {
  isMobile: boolean | undefined;
  connecting: boolean;
  onClick: () => void;
}

export const LoggedInWalletButton: FC<LoggedInWalletButtonProps> = ({
  isMobile,
  connecting,
  onClick,
}) => {
  const classes = useStyles();

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <Box className={classes.connectWrapper}>
      {connecting ? (
        <HydraButton arial-label="Connecting" kind="primary" disabled>
          <Connection width="23px" height="12px" />
          <Typography>Connecting...</Typography>
        </HydraButton>
      ) : (
        <HydraButton
          arial-label="Connect wallet"
          kind="primary"
          onClick={handleClick}
        >
          <WalletSVG width="16px" height="16px" />
          <Typography>{isMobile ? "Connect" : "Connect Wallet"}</Typography>
        </HydraButton>
      )}
    </Box>
  );
};
