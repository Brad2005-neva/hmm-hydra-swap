import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import cn from "classnames";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  svgIcon: {
    width: "88px",
    height: "88px",
    margin: "42px 0",
    "& + p": {
      color: `${palette.white}${alpha[85]}`,
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "22px",
    },
  },
  svgPending: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    borderRadius: "50%",
    boxSizing: "border-box",
    padding: "8px",
    position: "relative",
  },
  pendingLoader: {
    background: palette.darkBlue.primary,
    borderRadius: "50%",
    width: "100%",
    height: "100%",
  },
  loader: {
    position: "absolute",
    top: "-1px",
    left: "-1px",
    width: "90px",
    height: "90px",
    border: "10px solid transparent",
    borderBottomColor: palette.darkBlue.primary,
    borderRadius: "50%",
    display: "inline-block",
    boxSizing: "border-box",
    animation: "$rotate 3s linear infinite",
  },
  "@keyframes rotate": {
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(359deg)",
    },
  },
});

const Loader = () => {
  const classes = useStyles();

  return (
    <Box className={cn(classes.svgIcon, classes.svgPending)}>
      <Box className={classes.pendingLoader} />
      <span className={classes.loader} />
    </Box>
  );
};

export default Loader;
