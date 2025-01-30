import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { ReactNode } from "react";

const useStyles = makeStyles({
  routesWrapper: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    margin: "0 24px 20px",
    height: "calc(100vh - 116px)",
    overflow: "auto",
    "@media (max-width:600px)": {
      margin: "20px 10px",
      height: "calc(100vh - 100px)",
      maxHeight: "initial",
    },
  },
});

const RoutesWrapper = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <Box className={classes.routesWrapper}>{children}</Box>;
};

export default RoutesWrapper;
