import { Decimal } from "@hydraprotocol/sdk";
import { getTVLInUSD, getSharePercent } from "./lib";

test("getTVLInUSD", () => {
  const lpTVLInUSD = getTVLInUSD({
    scaledTokenAPrice: Decimal.from(1_000000n, 6n),
    scaledTokenBPrice: Decimal.from(1_000000n, 6n),
    tokenAVaultBalance: Decimal.from(100_000000n, 6n),
    tokenBVaultBalance: Decimal.from(100_000000n, 6n),
  });
  expect(`${lpTVLInUSD}`).toBe("200"); // ??
});

test("getSharePercent", () => {
  const sharePercent = getSharePercent({
    lpTokenBalance: Decimal.from(50_000000n, 6n),
    lpTokenSupply: Decimal.from(100_000000n, 6n),
  });

  expect(`${sharePercent}`).toBe("50");
});
