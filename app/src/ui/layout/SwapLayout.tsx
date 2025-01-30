import { ReactNode } from "react";
import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { palette, alpha } from "@utils/palette";
export const useStyles = makeStyles({
  swapContent: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "450px",
    width: "100%",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  title: {
    color: palette.white,
    fontSize: "20px",
    fontWeight: "500",
    lineHeight: "24px",
  },
  swapIcons: {
    display: "flex",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      width: "20px",
      height: "20px",
      color: `${palette.white}${alpha[65]}`,
    },
    "& .MuiIconButton-root": {
      padding: "0",
    },
  },
  swapAssets: {
    background: `linear-gradient(180deg, ${palette.green.light}${alpha[25]} 0%, ${palette.blue.light}${alpha[0]} 100%)`,
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    padding: "2px",
  },
  routeContainer: {
    background: palette.darkBlue.dark,
    borderRadius: "6px",
    padding: "20px 32px",
    margin: "2px",
  },
  routeTitle: {
    color: `${palette.white}${alpha[65]}`,
    fontSize: "14px !important",
    lineHeight: "17px !important",
    textDecoration: "underline",
    marginBottom: "16px !important",
  },
  routeDetail: {
    display: "flex",
  },
  assetItem: {
    color: `${palette.white}${alpha[85]}`,
    display: "flex",
    alignItems: "center",
    marginRight: "12px",
    "& img": {
      marginRight: "4px",
      width: "20px",
      height: "20px",
    },
    "& span": {
      fontSize: "14px",
      lineHeight: "17px",
    },
    "&:last-of-type": {
      marginRight: "0",
    },
  },
});

export function SwapLayout({
  swapIcons,
  children,
  title,
}: {
  swapIcons: ReactNode;
  children: ReactNode;
  title: ReactNode;
}) {
  const classes = useStyles();

  return (
    <Box className={classes.swapContent}>
      <Box className={classes.actionRow}>
        <span className={classes.title}>{title}</span>
        <div className={classes.swapIcons}>{swapIcons}</div>
      </Box>
      <Box className={classes.swapAssets}>{children}</Box>
    </Box>
  );
}
