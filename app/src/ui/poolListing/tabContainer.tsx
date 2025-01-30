import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";

const useStyles = makeStyles({
  tabContainer: {
    display: "flex",
    flexDirection: "column",
  },
});

const TabContainer = ({ children }: { children: JSX.Element | undefined }) => {
  const classes = useStyles();

  return <Box className={classes.tabContainer}>{children}</Box>;
};

export default TabContainer;
