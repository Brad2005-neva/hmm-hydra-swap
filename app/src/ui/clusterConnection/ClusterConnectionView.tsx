import { Typography, Tooltip } from "@mui/material";
import { Warning } from "../icons";
import { makeStyles } from "@mui/styles";
import { palette } from "@utils/palette";

export const useStyles = makeStyles({
  connectionWrapper: {
    marginRight: "16px",
    "& *": {
      color: palette.red.primary,
    },
    "& svg": {
      width: "19px",
      height: "16px",
      cursor: "pointer",
    },
  },
});
export function ClusterConnectionView() {
  const classes = useStyles();

  return (
    <Tooltip title="Cluster connection issue..." placement="bottom" arrow>
      <Typography className={classes.connectionWrapper}>
        <Warning />
      </Typography>
    </Tooltip>
  );
}
