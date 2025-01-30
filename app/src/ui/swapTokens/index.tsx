import { useMemo } from "react";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { TokenField } from "@hydraprotocol/services";

import { AssetBalance } from "@types";
import TokenItem from "./TokenItem";
import TokenExchange from "./TokenExchange";

const useStyles = makeStyles({
  tokensContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "24px",
    width: "100%",
    "& + .MuiButton-root": {
      marginTop: "20px",
    },
  },
});

export const SwapTokens = ({
  tokenFrom,
  tokenTo,
  balances,
  setFocus,
  onSwitchToken,
  toggleFields,
}: {
  tokenFrom: TokenField;
  tokenTo: TokenField;
  balances: AssetBalance;
  setFocus: (focus: "from" | "to") => void;
  onSwitchToken: (type: string) => void;
  toggleFields: () => void;
}) => {
  const classes = useStyles();

  const fromBalance = useMemo(() => {
    const address = tokenFrom.asset?.address;

    if (!address || !tokenFrom.asset || !balances.has(address)) return 0n;

    return balances.get(address) ?? 0n;
  }, [tokenFrom.asset, balances]);

  const toBalance = useMemo(() => {
    const address = tokenTo.asset?.address;

    if (!address || !tokenTo.asset || !balances.has(address)) return 0n;

    return balances.get(address) ?? 0n;
  }, [tokenTo.asset, balances]);

  return (
    <Box className={classes.tokensContainer}>
      <TokenItem
        token={tokenFrom}
        direction="from"
        balance={fromBalance}
        setFocus={setFocus}
        onSwitchToken={onSwitchToken}
        autoFocus
      />
      <TokenExchange onToggle={toggleFields} />
      <TokenItem
        disabled
        token={tokenTo}
        direction="to"
        balance={toBalance}
        setFocus={setFocus}
        onSwitchToken={onSwitchToken}
      />
    </Box>
  );
};
