import { useCallback } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { Decimal } from "@hydraprotocol/sdk";
import { TokenField } from "@hydraprotocol/services";

import NumericField from "@components/numericField";
import { toFormat } from "@utils/toFormat";
import { fromFormat } from "@utils/fromFormat";
import { palette, alpha } from "@utils/palette";
import SelectToken from "./SelectToken";

const useStyles = makeStyles({
  assetDetail: {
    color: `${palette.white}${alpha[85]}`,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    "& .MuiTypography-root": {
      lineHeight: "19px",
    },
  },
  cursorPointer: {
    cursor: "pointer",
  },
  assetInput: {
    background: palette.darkBlue.light,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    padding: "8px",
  },
  maxButton: {
    color: `${palette.white}${alpha[65]}`,
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "17px",
    marginRight: "8px",
  },
});

export const TokenItem = ({
  token,
  direction,
  disabled = false,
  balance,
  setFocus,
  onSwitchToken,
  autoFocus,
}: {
  token: TokenField;
  disabled?: boolean;
  direction: "from" | "to";
  balance: bigint;
  setFocus: (focus: "from" | "to") => void;
  onSwitchToken: (type: string) => void;
  autoFocus?: boolean;
}) => {
  const classes = useStyles();

  const setMaxBalance = useCallback(() => {
    token.setAmount(balance), setFocus(direction);
  }, [token, balance, setFocus, direction]);

  return (
    <Box>
      <Box className={classes.assetDetail}>
        <Typography>
          {direction.charAt(0).toUpperCase() + direction.slice(1)}
        </Typography>
        <Typography aria-label={`${token.asset?.symbol} inline balance`}>
          <span className={classes.cursorPointer} onClick={setMaxBalance}>
            Balance:{" "}
            {token.asset
              ? Decimal.fromAmountAndToken(balance, token).toFormat(
                  Decimal.FORMAT_TOKEN,
                  token.asset?.decimals
                )
              : ""}
          </span>
        </Typography>
      </Box>
      <Box className={classes.assetInput}>
        <NumericField
          disabled={disabled}
          aria-label={`Token ${direction === "from" ? "A" : "B"} Amount`}
          value={toFormat(token.amount, token.asset?.decimals)}
          decimals={token.asset?.decimals}
          onChange={(value: number) => {
            token.setAmount(fromFormat(value, token.asset?.decimals));
          }}
          onFocus={() => setFocus(direction)}
          autoFocus={autoFocus}
        />
        {!disabled && (
          <span className={classes.maxButton} onClick={setMaxBalance}>
            Max
          </span>
        )}
        <SelectToken
          aria-label={`Select token ${direction === "from" ? "A" : "B"}`}
          token={token}
          changeToken={() => onSwitchToken(direction)}
        />
      </Box>
    </Box>
  );
};

export default TokenItem;
