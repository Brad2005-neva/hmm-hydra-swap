import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import cn from "classnames";
import { Tooltip } from "../../tooltip";
import { palette } from "@utils/palette";

const useStyles = makeStyles({
  badgeContainer: {
    display: "flex",
    position: "absolute",
    top: "-15px",
    "@media (max-width: 600px)": {
      flexDirection: "column",
    },
  },
  badge: {
    backgroundColor: palette.green.dark,
    backdropFilter: "blur(20px)",
    borderRadius: "4px",
    color: palette.green.primary,
    cursor: "pointer",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "16px",
    padding: "6px 10px",
    position: "relative",
    "& span": {
      position: "relative",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
      background: palette.green.dark,
      borderRadius: "4px",
    },
  },
  hmmBadge: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
  },
});

function PoolBadge({
  name,
  type,
  cValue,
}: {
  name: string;
  type?: string;
  cValue: number;
}) {
  const classes = useStyles();

  return (
    <Box className={classes.badgeContainer}>
      <Box
        className={cn(classes.badge, { [classes.hmmBadge]: type === "hmm" })}
      >
        <Tooltip
          title={
            <p>
              HMM pricing algorithm with compensation parameter (c) = {cValue}.
              Read about the methodology{" "}
              <a
                rel="noreferrer"
                href="https://medium.com/hydraswap/the-hydraswap-hmm-game-changing-amm-for-liquidity-providers-ba8e99a22713"
                target="_blank"
              >
                here
              </a>
              .
            </p>
          }
          placement="bottom-start"
          arrow
        >
          <span>{name}</span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default PoolBadge;
