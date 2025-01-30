import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { ReactNode } from "react";

import { palette } from "@utils/palette";

const useStyles = makeStyles({
  swapContainer: {
    background: palette.darkBlue.dark,
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
  },
});

export const SwapContainer = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.swapContainer}>{children}</Box>;
};
