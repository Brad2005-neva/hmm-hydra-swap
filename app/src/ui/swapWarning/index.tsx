import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Warning } from "../icons";
import { palette } from "@utils/palette";

const useStyles = makeStyles({
  poolStatus: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    width: "100%",
    "& > p": {
      flexGrow: 1,
      fontSize: "14px",
      lineHeight: "17px",
      padding: "0 6px",
    },
  },
  noPool: {
    color: palette.red.primary,
  },
});

const SwapWarning = ({
  warning,
  label,
}: {
  warning: string;
  label?: string;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.poolStatus} aria-label={label}>
      <Warning className={classes.noPool} />
      <Typography className={classes.noPool}>{warning}</Typography>
    </Box>
  );
};

export default SwapWarning;
