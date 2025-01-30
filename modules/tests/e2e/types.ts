export type ExpectInlineBalanceProps = {
  tokenA: string;
  tokenABal: string;
  tokenB: string;
  tokenBBal: string;
};

export type ExpectExchangeRateProps = {
  tokenA: string;
  tokenB: string;
  tokenBRatio: string;
};

export type UserTypes = "trader" | "treasury";
