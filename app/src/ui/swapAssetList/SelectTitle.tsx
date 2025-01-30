import { ReactNode } from "react";
import { makeStyles } from "@mui/styles";
import { Typography } from "@mui/material";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  title: {
    color: `${palette.white}${alpha[65]}`,
    fontSize: "14px",
    lineHeight: "17px",
    padding: "16px 0",
  },
});

export const SelectTitle = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Typography className={classes.title}>{children}</Typography>;
};
