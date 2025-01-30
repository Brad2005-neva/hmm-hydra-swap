import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { TokenField } from "@hydraprotocol/services";

import { AmountDetail } from "..";
import NumericField from "@components/numericField";
import { fromFormat } from "@utils/fromFormat";
import HYSD from "@assets/images/symbols/hysd.png";
import { alpha, palette } from "@utils/palette";
import { Decimal } from "@hydraprotocol/sdk";

const useStyles = makeStyles({
  depositAmount: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  amountInputWrapper: {
    position: "relative",
    "& .MuiInputBase-root": {
      background: `${palette.white}${alpha[5]}`,
      borderRadius: "6px",
      padding: "17px 100px 17px 16px",
      width: "100%",
      "& input": {
        color: `${palette.white}${alpha[85]}`,
        fontSize: "18px",
        fontWeight: "500",
        lineHeight: "22px",
        height: "22px",
        padding: 0,
      },
    },
  },
  amountAsset: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    right: "16px",
    transform: "translateY(-50%)",
    "& img": {
      width: "24px",
      height: "24px",
      marginRight: "4px",
    },
    "& p": {
      color: palette.white,
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "17px",
    },
  },
});

function DepositLiquidityAmount({
  token,
  tokenBalance,
  setMaxBalance,
  setFocus,
  autoFocus,
}: {
  token: TokenField;
  tokenBalance: bigint;
  setMaxBalance(): void;
  setFocus(): void;
  autoFocus?: boolean;
}) {
  const classes = useStyles();

  return (
    <Box className={classes.depositAmount}>
      <AmountDetail
        tokenBalance={tokenBalance}
        tokenSymbol={token.asset?.symbol}
        tokenDecimal={token.asset?.decimals}
        onMaxClicked={setMaxBalance}
      />
      <Box className={classes.amountInputWrapper}>
        <NumericField
          value={Decimal.fromToken(token).toNumber()}
          onChange={(value: number) => {
            token.setAmount(fromFormat(value, token.asset?.decimals));
          }}
          onFocus={setFocus}
          decimals={token.asset?.decimals}
          aria-label={`Deposit Liquidity ${token.asset?.symbol}`}
          autoFocus={autoFocus}
        />
        <Box className={classes.amountAsset}>
          <img
            src={
              token.asset?.symbol.includes("HYD") ? HYSD : token.asset?.logoURI
            }
            alt="Coin"
          />
          <Typography>{token.asset?.symbol}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default DepositLiquidityAmount;
