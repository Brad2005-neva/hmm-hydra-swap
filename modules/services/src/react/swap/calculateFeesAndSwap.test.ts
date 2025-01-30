import {
  AccountData,
  Asset,
  LiquidityPoolsCalculator,
  PoolState,
  TokenAccount,
  TokenMint,
} from "@hydraprotocol/sdk";
import { calculateFeesAndSwap } from "./calculateFeesAndSwap";

describe("test calculateSwap", () => {
  let calculator: LiquidityPoolsCalculator;

  const tokenXMint = {
    pubkey: "So11111111111111111111111111111111111111112",
    account: { data: { decimals: 9 } },
  } as unknown as AccountData<TokenMint>;
  const tokenYMint = {
    pubkey: "usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f",
    account: { data: { decimals: 6 } },
  } as unknown as AccountData<TokenMint>;

  const tokenXVault = {
    account: { data: { amount: 3_171071301n } },
  } as unknown as AccountData<TokenAccount>;
  const tokenYVault = {
    account: { data: { amount: 48_491935n } },
  } as unknown as AccountData<TokenAccount>;

  const poolState = {
    account: {
      data: {
        cValue: 150,
        fees: {
          feeCalculation: "Percent",
          feeMinPct: 500000000,
          feeMaxPct: 20000000000,
          feeLastUpdate: 0,
          feeLastPrice: 0,
          feeLastEwma: 17836758,
          feeEwmaWindow: 3600,
          feeLambda: 545000000000,
          feeVelocity: 4166666667,
        },
      },
    },
  } as unknown as AccountData<PoolState>;

  const tokenPrices = {
    oracle: { USDC: 1, wSOL: 33 },
  } as unknown as
    | { oracle: Record<string, number>; rest: Record<string, number> }
    | undefined;
  beforeEach(() => {
    calculator = LiquidityPoolsCalculator.create();
  });
  test("the correct value is properly calculated for a YX swap", async () => {
    const tokenFromAsset = {
      address: "usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f",
      symbol: "USDC",
    } as unknown as Asset;

    const tokenToAsset = {
      address: "So11111111111111111111111111111111111111112",
      symbol: "wSOL",
    } as unknown as Asset;

    // mock the props
    // see if tokenTo/tokenFrom amount is correct
    const result = await calculateFeesAndSwap(
      calculator,
      50_000000n,
      tokenXMint,
      tokenYMint,
      tokenXVault,
      tokenYVault,
      poolState,
      tokenFromAsset,
      tokenToAsset,
      tokenPrices,
      () => {},
      "yx"
    );

    expect(result).toStrictEqual({
      amount: 1_352238519n,
      fees: 500000000n,
    });
  });

  test("the correct value is properly calculated for a XY swap", async () => {
    const tokenFromAsset = {
      address: "So11111111111111111111111111111111111111112",
      symbol: "wSOL",
    } as unknown as Asset;

    const tokenToAsset = {
      address: "usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f",
      symbol: "USDC",
    } as unknown as Asset;
    // mock the props
    // see if tokenTo/tokenFrom amount is correct
    const result = await calculateFeesAndSwap(
      calculator,
      1_000000000n,
      tokenXMint,
      tokenYMint,
      tokenXVault,
      tokenYVault,
      poolState,
      tokenFromAsset,
      tokenToAsset,
      tokenPrices,
      () => {},
      "xy"
    );

    expect(result).toStrictEqual({
      amount: 11_621354n,
      fees: 500000000n,
    });
  });
});
