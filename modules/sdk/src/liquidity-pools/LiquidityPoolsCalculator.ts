import {
  AccountData,
  Decimal,
  Log,
  PoolState,
  TokenAccount,
  TokenMint,
} from "..";
import * as api from "./api";

export class LiquidityPoolsCalculator {
  constructor() {}

  /**
   *
   * Calculate fees based on given transaction parameters.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolState PoolState data
   * @param amount Amount of the swap input
   * @param direction Direction of the swap x -> y ("xy") or y -> x ("yx")
   * @param feeThisUpdate
   * @param tokenXPrice Pyth symbol key for looking up the price on tokenPrices
   * @param tokenYPrice Pyth symbol key for looking up the price on tokenPrices
   * @returns An bigint array with 6 values: `feeAmount`, `feePercentage`, `amountExFee`, `feeLastUpdate`, `feeLastPrice`, `feeLastEwma`
   */
  calculateFees = (
    tokenXMint: AccountData<TokenMint>,
    tokenYMint: AccountData<TokenMint>,
    poolState: AccountData<PoolState>,
    amount: bigint,
    direction: "xy" | "yx",
    feeThisUpdate: bigint,
    log: Log,
    tokenXPrice: Decimal,
    tokenYPrice: Decimal
  ): Promise<[bigint, bigint, bigint, bigint, bigint, bigint]> => {
    return api.calculateFees(
      tokenXMint,
      tokenYMint,
      poolState,
      amount,
      direction,
      feeThisUpdate,
      log,
      tokenXPrice,
      tokenYPrice
    );
  };

  /**
   *
   * Calculate swap amounts exclusive of fees based on given transaction parameters.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param tokenXVault TokenX Pool Vault Account
   * @param tokenYVault TokenY Pool Vault Account
   * @param poolState PoolState data for the calculation
   * @param amount Amount of the swap input
   * @param direction Direction of the swap x -> y ("xy") or y -> x ("yx")
   * @param tokenXPrice Pyth token X price
   * @param tokenYPrice Pyth token Y price
   * @returns An bigint array with 2 values: `deltaX`, `deltaY`
   */
  calculateSwap = (
    tokenXMint: AccountData<TokenMint>,
    tokenYMint: AccountData<TokenMint>,
    tokenXVault: AccountData<TokenAccount>,
    tokenYVault: AccountData<TokenAccount>,
    poolState: AccountData<PoolState>,
    amount: bigint,
    direction: "xy" | "yx",
    log: Log,
    tokenXPrice: Decimal,
    tokenYPrice: Decimal
  ): Promise<[bigint, bigint]> => {
    return api.calculateSwap(
      tokenXMint,
      tokenYMint,
      tokenXVault,
      tokenYVault,
      poolState,
      amount,
      direction,
      log,
      tokenXPrice,
      tokenYPrice
    );
  };

  static create() {
    return new LiquidityPoolsCalculator();
  }
}
