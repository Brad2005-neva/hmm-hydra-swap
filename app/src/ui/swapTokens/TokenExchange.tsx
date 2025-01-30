import { makeStyles } from "@mui/styles";
import { IconButton } from "@mui/material";

import { Exchange } from "@ui/icons";

const useStyles = makeStyles({
  exchangeButton: {
    alignSelf: "center",
    background: "none",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    margin: "24px 0",
    "& svg": {
      width: "20px",
      height: "20px",
      transform: "rotate(90deg)",
    },
  },
});

export const TokenExchange = ({ onToggle }: { onToggle: () => void }) => {
  const classes = useStyles();

  return (
    <IconButton
      className={classes.exchangeButton}
      onClick={onToggle}
      tabIndex={1}
    >
      <Exchange />
    </IconButton>
  );
};

export default TokenExchange;
