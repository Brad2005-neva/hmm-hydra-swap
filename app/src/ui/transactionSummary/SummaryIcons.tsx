import { makeStyles } from "@mui/styles";

import { ArrowDown, Plus, Exchange } from "@ui/icons";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  svg: {
    color: `${palette.white}${alpha[85]}`,
    margin: "20px 10px",
    width: "16px !important",
    height: "16px !important",
  },
});

export const ArrowDownSvg = () => {
  const classes = useStyles();

  return <ArrowDown className={classes.svg} />;
};

export const PlusSvg = () => {
  const classes = useStyles();

  return <Plus className={classes.svg} />;
};

export const ExchangeSvg = () => {
  const classes = useStyles();

  return <Exchange className={classes.svg} />;
};
