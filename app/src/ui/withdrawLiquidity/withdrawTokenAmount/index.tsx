import { Typography } from "@mui/material";

import { TokenField } from "@hydraprotocol/services";
import { AccountData, Decimal, TokenAccount } from "@hydraprotocol/sdk";

import InlineData from "../../inlineData";

interface TokenAmountProps {
  tokenA: TokenField;
  tokenB: TokenField;
  tokenAVault?: AccountData<TokenAccount>;
  tokenBVault?: AccountData<TokenAccount>;
  percent: bigint;
  lpSupply: bigint;
  lpAmount: bigint;
}

const TokenAmount = ({
  tokenA,
  tokenB,
  tokenAVault,
  tokenBVault,
  percent,
  lpSupply,
  lpAmount,
}: TokenAmountProps) => {
  const tokenAAmount = Decimal.fromVaultAndToken(tokenAVault, tokenA);
  const tokenBAmount = Decimal.fromVaultAndToken(tokenBVault, tokenB);
  const percentToDecimal = Decimal.from(percent, 4n);

  const lpSupplyToDecimal = Decimal.from(lpSupply, 9n);
  const lpAmountToDecimal = Decimal.from(lpAmount, 9n);

  const tokenAWithdrawn = tokenAAmount
    .mul(percentToDecimal)
    .mul(lpAmountToDecimal)
    .div(lpSupplyToDecimal)
    .toFormat(Decimal.FORMAT_TOKEN, tokenA.asset?.decimals);

  const tokenBWithdrawn = tokenBAmount
    .mul(percentToDecimal)
    .mul(lpAmountToDecimal)
    .div(lpSupplyToDecimal)
    .toFormat(Decimal.FORMAT_TOKEN, tokenB.asset?.decimals);

  return (
    <InlineData
      title="Tokens to be received"
      main={
        <>
          <Typography aria-label={`Token ${tokenA.asset?.symbol} Percent`}>
            {`${tokenAWithdrawn} ${tokenA.asset?.symbol}`}
          </Typography>
          <Typography aria-label={`Token ${tokenB.asset?.symbol} Percent`}>
            {`${tokenBWithdrawn} ${tokenB.asset?.symbol}`}
          </Typography>
        </>
      }
    />
  );
};

export default TokenAmount;
