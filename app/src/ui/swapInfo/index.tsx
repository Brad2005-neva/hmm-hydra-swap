import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { TokenField } from "@hydraprotocol/services";
import { PoolFeeType } from "@hydraprotocol/sdk";

import ExchangeRate from "@ui/exchangeRate";
import SwapFee from "@components/swapFee";
import DisplayCValue from "@components/cValue";

const useStyles = makeStyles({
  detailWrapper: {
    display: "flex",
    flexDirection: "column",
    marginTop: "24px",
    marginBottom: "14px",
    width: "100%",
  },
});

export const SwapInfo = ({
  tokenFrom,
  tokenTo,
  isHMM,
  fee,
  feeType,
  cValue,
}: {
  tokenFrom: TokenField;
  tokenTo: TokenField;
  isHMM: boolean | undefined;
  fee: bigint;
  feeType: PoolFeeType | undefined;
  cValue: number | undefined;
}) => {
  const classes = useStyles();

  return (
    <>
      {tokenFrom.asset &&
        Number(tokenFrom.amount) > 0 &&
        tokenTo.asset &&
        Number(tokenTo.amount) > 0 && (
          <Box className={classes.detailWrapper}>
            <ExchangeRate
              tokenA={tokenFrom}
              tokenB={tokenTo}
              tokenAAmount={tokenFrom.amount}
              tokenBAmount={tokenTo.amount}
              isHMM={isHMM}
              tabIndex={1}
            />
            <SwapFee fee={fee} feeType={feeType} tabIndex={1} />
            {!!cValue && <DisplayCValue cValue={cValue} />}
          </Box>
        )}
    </>
  );
};
