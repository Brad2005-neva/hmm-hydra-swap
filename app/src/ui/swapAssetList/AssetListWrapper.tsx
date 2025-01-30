import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { ReactNode } from "react";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  assetListWrapper: {
    borderTop: `1px solid ${palette.white}${alpha[5]}`,
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "300px",
    overflowY: "auto",
  },
});

export const AssetListWrapper = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.assetListWrapper}>{children}</Box>;
};
