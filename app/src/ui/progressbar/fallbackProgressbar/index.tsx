import { makeStyles } from "@mui/styles";
import { Box, LinearProgress } from "@mui/material";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  fallbackContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "4px",
    width: "100%",
  },
  progress: {
    backgroundColor: `${palette.green.primary}${alpha[5]} !important`,
    "& .MuiLinearProgress-bar": {
      backgroundColor: `${palette.green.primary}${alpha[65]}`,
    },
  },
});

const FallbackProgressbar = () => {
  const classes = useStyles();

  return (
    <Box className={classes.fallbackContainer}>
      <LinearProgress className={classes.progress} />
    </Box>
  );
};

export default FallbackProgressbar;
