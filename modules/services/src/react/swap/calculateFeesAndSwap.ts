import {
  AccountData,
  Asset,
  Decimal,
  LiquidityPoolsCalculator,
  Log,
  PoolState,
  TokenAccount,
  TokenMint,
} from "@hydraprotocol/sdk";

const sortPythPriceToMint = (
  tokenAddress: string,
  mintAddress: string,
  tokenPrice: number,
  otherTokenPrice: number
): number => {
  return tokenAddress === mintAddress ? tokenPrice : otherTokenPrice;
};

export const calculateFeesAndSwap = async (
  calculator: LiquidityPoolsCalculator,
  amount: bigint,
  tokenXMint: AccountData<TokenMint> | undefined,
  tokenYMint: AccountData<TokenMint> | undefined,
  tokenXVault: AccountData<TokenAccount> | undefined,
  tokenYVault: AccountData<TokenAccount> | undefined,
  poolState: AccountData<PoolState> | undefined,
  tokenFromAsset: Asset | undefined,
  tokenToAsset: Asset | undefined,
  tokenPrices:
    | {
        oracle: Record<string, number>;
        rest: Record<string, number>;
      }
    | undefined,
  log: Log,
  direction?: "xy" | "yx"
) => {
  if (
    !tokenXMint ||
    !tokenYMint ||
    !tokenXVault ||
    !tokenYVault ||
    !poolState ||
    !tokenFromAsset ||
    !tokenToAsset
  )
    return { amount: 0n, fees: 0n };

  if (!direction) throw new Error("Asset is not part of pool mints");

  const tokenFromPrice = tokenPrices?.oracle[tokenFromAsset.symbol] || 0;
  const tokenToPrice = tokenPrices?.oracle[tokenToAsset.symbol] || 0;

  const tokenXPrice = sortPythPriceToMint(
    tokenFromAsset.address,
    tokenXMint.pubkey.toString(),
    tokenFromPrice,
    tokenToPrice
  );

  const tokenYPrice = sortPythPriceToMint(
    tokenToAsset.address,
    tokenYMint.pubkey.toString(),
    tokenToPrice,
    tokenFromPrice
  );

  const [, feePercentage, amountExFee, , ,] = await calculator.calculateFees(
    tokenXMint,
    tokenYMint,
    poolState,
    amount,
    direction,
    BigInt(Math.round(Date.now() / 1000)),
    log,
    Decimal.fromNumber(tokenXPrice || 0),
    Decimal.fromNumber(tokenYPrice || 0)
  );

  const [deltaX, deltaY] = await calculator.calculateSwap(
    tokenXMint,
    tokenYMint,
    tokenXVault,
    tokenYVault,
    poolState,
    amountExFee,
    direction,
    log,
    Decimal.fromNumber(tokenXPrice || 0),
    Decimal.fromNumber(tokenYPrice || 0)
  );

  return {
    amount: direction === "xy" ? deltaY : deltaX,
    fees: feePercentage,
  };
};
