import { AccountData, Decimal, TokenMint } from "@hydraprotocol/sdk";

export function getTVLInUSD(p: {
  scaledTokenAPrice: Decimal;
  scaledTokenBPrice: Decimal;
  tokenAVaultBalance: Decimal;
  tokenBVaultBalance: Decimal;
}) {
  const lpTokenAAmountInUSD = p.tokenAVaultBalance.mul(p.scaledTokenAPrice);
  const lpTokenBAmountInUSD = p.tokenBVaultBalance.mul(p.scaledTokenBPrice);
  const lpTVLInUSD = lpTokenAAmountInUSD.add(lpTokenBAmountInUSD);

  return lpTVLInUSD;
}

export function getLpTokenBalanceInUSD(p: {
  lpTVLInUSD: Decimal;
  sharePercent: Decimal;
}) {
  return p.lpTVLInUSD.mul(p.sharePercent.div(Decimal.from(100n)));
}

export function getLiquidityData({
  lpTokenUserBalance,
  lpTokenMint,
  lpTokenSupply,
  lpTVLInUSD,
}: {
  lpTokenUserBalance: bigint;
  lpTokenSupply: Decimal;
  lpTVLInUSD: Decimal;
  lpTokenMint?: AccountData<TokenMint>;
}) {
  const lpTokenBalanceBigInt = Decimal.fromAmountAndMint(
    lpTokenUserBalance,
    lpTokenMint
  );
  const shareRatio = lpTokenBalanceBigInt.div(lpTokenSupply);
  const sharePercent = shareRatio.mul(Decimal.from(100n));

  const lpTokenAmountBalance = lpTVLInUSD.mul(shareRatio);

  return {
    lpTokenBalanceBigInt,
    sharePercent,
    lpTokenAmountBalance,
  };
}

export function getSharePercent(p: {
  lpTokenBalance: Decimal;
  lpTokenSupply: Decimal;
}) {
  if (p.lpTokenSupply.eq(Decimal.from(0n))) return Decimal.from(0n);

  return Decimal.from(100n).mul(p.lpTokenBalance.div(p.lpTokenSupply));
}

export function scaleToUSD(amount?: number) {
  const precision = 6; // dont loose precision
  return Decimal.from(
    BigInt(Math.floor((amount ?? 0) * 10 ** precision)),
    BigInt(precision)
  );
}
