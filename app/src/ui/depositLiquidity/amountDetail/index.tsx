import { Box, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Decimal } from "@hydraprotocol/sdk";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  amountDetail: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
    "& > p": {
      fontSize: "14px",
      lineHeight: "17px",
      "& span": {
        color: "#FFF",
        fontWeight: "500",
      },
    },
    "& > .MuiButton-root": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "13px",
      lineHeight: "16px",
      padding: 0,
      minWidth: "initial",
      textTransform: "capitalize",
    },
  },
});

const AmountDetail = ({
  tokenBalance,
  tokenSymbol,
  tokenDecimal,
  onMaxClicked,
}: {
  tokenBalance: bigint;
  tokenSymbol: string | undefined;
  tokenDecimal: number | undefined;
  onMaxClicked(): void;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.amountDetail}>
      <Typography aria-label={`Token ${tokenSymbol} Balance`}>
        Balance:{" "}
        {Decimal.from(tokenBalance, BigInt(tokenDecimal || 6)).toFormat(
          Decimal.FORMAT_TOKEN,
          tokenDecimal
        )}
      </Typography>
      <Button onClick={onMaxClicked} tabIndex={1}>
        Max
      </Button>
    </Box>
  );
};

export default AmountDetail;
