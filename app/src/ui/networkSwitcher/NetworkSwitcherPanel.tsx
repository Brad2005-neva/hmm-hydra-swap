import { ReactNode } from "react";
import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { palette, alpha } from "@utils/palette";
export const useStyles = makeStyles({
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    "& > .MuiButton-root": {
      borderRadius: 0,
      borderBottom: `1px solid transparent`,
      color: `${palette.white}${alpha[85]}`,
      display: "flex",
      justifyContent: "space-between",
      fontSize: "18px",
      fontWeight: "400",
      lineHeight: "21px",
      padding: "16px 0",
      textTransform: "capitalize",
      transition: "none",
      "& > svg": {
        fill: palette.green.primary,
        width: "21px",
        height: "15px",
      },
      "& > .MuiTouchRipple-root": {
        display: "none",
      },
      "&:hover": {
        backgroundColor: "transparent",
        borderBottomColor: `${palette.white}${alpha[5]}`,
      },
    },
  },
});
export function NetworkSwitcherPanel({ children }: { children: ReactNode }) {
  const classes = useStyles();

  return <Box className={classes.contentWrapper}>{children}</Box>;
}
