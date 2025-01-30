import { useState } from "react";
import { Grid, IconButton, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import cn from "classnames";

import { Decimal } from "@hydraprotocol/sdk";
import { TokenField } from "@hydraprotocol/services";

import { Compare } from "../icons";
import InlineData from "../inlineData";

const useStyles = makeStyles({
  compareButton: {
    color: "inherit",
    padding: "0px",
    "& svg": {
      width: "16px",
      height: "17px",
    },
  },
  flip: {
    order: -1,
  },
});

interface ExchangeRateProps {
  tokenA: TokenField;
  tokenB: TokenField;
  tokenAAmount?: bigint;
  tokenBAmount?: bigint;
  flip?: boolean;
  isHMM?: boolean;
  tabIndex?: number;
}

function ExchangeRate({
  tokenA,
  tokenB,
  tokenAAmount = 1n,
  tokenBAmount = 1n,
  flip,
  isHMM,
  tabIndex,
}: ExchangeRateProps) {
  const [toggleRatio, setToggleRatio] = useState<boolean>(false);
  const classes = useStyles();

  const handleToggleRatio = () => {
    setToggleRatio(!toggleRatio);
  };

  const tokenASymbol = tokenA.asset?.symbol;
  const tokenBSymbol = tokenB.asset?.symbol;

  const tokenADeci = Decimal.fromAmountAndToken(tokenAAmount, tokenA);
  const tokenBDeci = Decimal.fromAmountAndToken(tokenBAmount, tokenB);

  const tokenBRatio = !tokenADeci.eq(Decimal.ZERO)
    ? tokenBDeci.div(tokenADeci)
    : Decimal.ZERO;
  const tokenARatio = !tokenBDeci.eq(Decimal.ZERO)
    ? tokenADeci.div(tokenBDeci)
    : Decimal.ZERO;

  const tokenARatioText = `1 ${tokenASymbol} = ${tokenBRatio.toFormat(
    Decimal.FORMAT_TOKEN,
    tokenB.asset?.decimals
  )} ${tokenBSymbol}`;
  const tokenBRatioText = `1 ${tokenBSymbol} = ${tokenARatio.toFormat(
    Decimal.FORMAT_TOKEN,
    tokenA.asset?.decimals
  )} ${tokenASymbol}`;
  const tipContent = isHMM ? "Hydra Market Maker" : undefined;
  return (
    <InlineData
      title="Price"
      main={
        <Grid container direction="row" gap="10px">
          <Typography aria-label="Exchange Rate Text">
            {toggleRatio ? tokenBRatioText : tokenARatioText}
          </Typography>
          <IconButton
            className={cn(classes.compareButton, { [classes.flip]: flip })}
            onClick={handleToggleRatio}
            disableRipple
            tabIndex={tabIndex}
          >
            <Compare aria-label="Exchange Rate Toggle" />
          </IconButton>
        </Grid>
      }
      tipContent={tipContent}
      ariaLabel="Price Popover"
    />
  );
}

export default ExchangeRate;
