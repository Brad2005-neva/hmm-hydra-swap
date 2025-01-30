import { FC } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography, Link, Button } from "@mui/material";

import { palette, alpha } from "@utils/palette";
import { Submitted } from "@ui/icons";

const useStyles = makeStyles({
  swapContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& .MuiLink-root": {
      marginBottom: "27px",
      textDecoration: "none",
      "& span": {
        backgroundImage: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
        backgroundSize: "100%",
        backgroundRepeat: "repeat",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
        "-moz-background-clip": "text",
        "-moz-text-fill-color": "transparent",
        cursor: "pointer",
        position: "relative",
        "&::after": {
          content: "''",
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "1px",
          width: "100%",
          backgroundImage: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
        },
      },
    },
  },
  svgSubmitted: {
    color: "transparent",
    width: "88px",
    height: "88px",
    margin: "42px 0",
    "& + p": {
      marginBottom: "16px",
      color: `${palette.white}${alpha[85]}`,
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "22px",
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

interface StatusDoneProps {
  hashLink: string;
  onClose(): void;
}

export const StatusDone: FC<StatusDoneProps> = ({ hashLink, onClose }) => {
  const classes = useStyles();

  return (
    <Box className={classes.swapContent}>
      <Submitted className={classes.svgSubmitted} />
      <Typography>Transaction Completed</Typography>
      <Link href={hashLink} target="_blank">
        <span>View on Solana Mainnet</span>
      </Link>
      <Button className={classes.closeButton} onClick={onClose} disableRipple>
        Close
      </Button>
    </Box>
  );
};
