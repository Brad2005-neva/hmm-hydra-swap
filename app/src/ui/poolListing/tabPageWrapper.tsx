import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";

const useStyles = makeStyles({
  tabPageWrapper: {
    width: "100%",
    marginTop: "32px",
    "@media (max-width: 600px)": {
      margin: "12px",
      width: "calc(100% - 24px)",
    },
  },
});

const TabPageWrapper = ({
  children,
}: {
  children: JSX.Element | (JSX.Element | null)[];
}) => {
  const classes = useStyles();

  return <Box className={classes.tabPageWrapper}>{children}</Box>;
};

export default TabPageWrapper;
