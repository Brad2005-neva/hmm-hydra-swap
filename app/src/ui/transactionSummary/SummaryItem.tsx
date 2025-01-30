import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { TokenField } from "@hydraprotocol/services";

import { palette } from "@utils/palette";
import HYSD from "@assets/images/symbols/hysd.png";

const useStyles = makeStyles({
  itemRow: {
    display: "flex",
    alignItems: "center",
    "& > p": {
      color: palette.white,
      fontSize: "20px !important",
      lineHeight: "24px !important",
      "&:first-of-type": {
        flexGrow: 1,
        padding: "0 10px",
      },
    },
  },
  imgWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
});

export const SummaryItem = ({
  token,
  amount,
}: {
  token: TokenField;
  amount: string;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.itemRow}>
      <span className={classes.imgWrapper}>
        <img
          src={token.asset?.name.includes("HYD") ? HYSD : token.asset?.logoURI}
          alt="Asset"
        />
      </span>
      <Typography>{amount}</Typography>
      <Typography>{token.asset?.symbol}</Typography>
    </Box>
  );
};
