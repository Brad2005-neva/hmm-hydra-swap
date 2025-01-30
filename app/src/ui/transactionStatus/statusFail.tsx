import { FC } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography, Button } from "@mui/material";

import { palette, alpha } from "@utils/palette";
import { Warning } from "@ui/icons";
import ErrorDetail from "./errorDetail";

const useStyles = makeStyles({
  swapContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  svgFail: {
    color: palette.red.primary,
    width: "107px",
    height: "93px",
    margin: "42px 0",
    "& + p": {
      color: `${palette.white}${alpha[85]}`,
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "22px",
      marginBottom: "16px",
    },
  },
  closeButton: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    borderRadius: "6px",
    color: palette.white,
    fontSize: "16px",
    fontWeight: "500",
    lineHeight: "24px",
    textTransform: "uppercase",
    padding: "16px",
    width: "100%",
  },
});

interface StatusFailProps {
  error: string | undefined;
  onClose(): void;
}

export const StatusFail: FC<StatusFailProps> = ({ error, onClose }) => {
  const classes = useStyles();

  return (
    <Box className={classes.swapContent}>
      <Warning className={classes.svgFail} />
      <Typography>Transaction Rejected</Typography>
      {error && <ErrorDetail error={error} />}
      <Button className={classes.closeButton} onClick={onClose} disableRipple>
        Dismiss
      </Button>
    </Box>
  );
};
