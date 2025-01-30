import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 1,
    "& .MuiButton-root": {
      minWidth: "112px",
      "& > p": {
        fontWeight: 500,
      },
      "&:last-of-type": {
        marginLeft: "12px",
      },
    },
    "@media (max-width: 600px)": {
      width: "100%",
      "& .MuiButton-root": {
        flexGrow: 1,
      },
    },
  },
});

function ButtonContainer({ children }: { children: ReactNode }) {
  const classes = useStyles();

  return <Box className={classes.buttons}>{children}</Box>;
}

export default ButtonContainer;
