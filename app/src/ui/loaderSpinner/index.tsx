import { Box, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { palette } from "@utils/palette";
const useStyles = makeStyles({
  progressSpinner: {
    display: "flex",
    justifyContent: "center",
  },
  progress: {
    color: palette.green.primary,
    minWidth: "80px",
    minHeight: "80px",
    margin: "80px auto",
  },
});

const LoaderSpinner = () => {
  const classes = useStyles();

  return (
    <Box className={classes.progressSpinner}>
      <CircularProgress className={classes.progress} />
    </Box>
  );
};

export default LoaderSpinner;
