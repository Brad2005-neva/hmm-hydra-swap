import { PublicKey, Transaction } from "@solana/web3.js";
import { Observable } from "rxjs";
import { Ctx, PoolInfo } from "../types";
import * as api from "./api";
import { LiquidityPoolsAccountHelpers } from "./LiquidityPoolsAccountHelpers";
import { FeatureType, Limits, OptionalPoolFees, PoolFees } from "./types";

/**
 * Interact with the on-chain liquidity pools program.
 *
 * Example:
 *
 * ```ts
 * import { LiquidityPools } from "@hydraprotocol/sdk";
 *
 * const ctx = HydraSDK.create(Network.DEVNET, connection, wallet).ctx;
 *
 * const liquidityPools = LiquidityPools.fromCtx(ctx);
 *
 * const txHash = await liquidityPools.addLiquidity(
 *   tokenXMint,
 *   tokenYMint,
 *   poolId,
 *   tokenXAmount,
 *   tokenYAmount,
 *   slippage
 * );
 *
 * console.log(`Your transaction hash: ${txHash}`);
 * ```
 *
 * A configured instance of this class is available under the `liquidityPools` of the `HydraSDK` class.
 *
 * ```ts
 * const hydra = HydraSDK.create(Network.DEVNET, connection, wallet);
 *
 * const txHash = await hydra.liquidityPools.addLiquidity(
 *   tokenXMint,
 *   tokenYMint,
 *   poolId,
 *   tokenXAmount,
 *   tokenYAmount,
 *   slippage
 * );
 *
 * console.log(`Your transaction hash: ${txHash}`);
 * ```
 *
 *
 */
export class LiquidityPools {
  constructor(
    private ctx: Ctx,
    public accounts = LiquidityPoolsAccountHelpers.fromCtx(ctx)
  ) {}
  /**
   * Call an RPC instruction to add liquidity to a given pool
   *
   * @remarks
   * Caller should ensure that the relative amounts of TokenX and TokenY hold the equivalent value.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId Pool ID
   * @param tokenXAmount Amount of token X tokens to provide
   * @param tokenYAmount Amount of token Y tokens to provide
   * @param slippage amount of acceptable slippage in basis points.
   * @returns the transaction hash of the resulting transaction
   *
   */
  addLiquidity = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    tokenXAmount: bigint,
    tokenYAmount: bigint,
    slippage?: bigint
  ): Promise<string> => {
    const method = await api.addLiquidity(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      tokenXAmount,
      tokenYAmount,
      slippage
    );
    return method.rpc();
  };

  /**
   * Create a transaction to add liquidity to a given pool
   *
   * @remarks
   * Caller should ensure that the relative amounts of TokenX and TokenY hold the equivalent value.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId Pool ID
   * @param tokenXAmount Amount of token X tokens to provide
   * @param tokenYAmount Amount of token Y tokens to provide
   * @param slippage amount of acceptable slippage in basis points.
   * @returns the transaction
   *
   */
  addLiquidityTx = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    tokenXAmount: bigint,
    tokenYAmount: bigint,
    slippage?: bigint
  ): Promise<Transaction> => {
    const method = await api.addLiquidity(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      tokenXAmount,
      tokenYAmount,
      slippage
    );
    return method.transaction();
  };

  /**
   * Return all pools as a PoolInfo list
   * @param start starting poolId
   * @param limit number of pools in the page
   * @returns A list of PoolInfo objects
   */
  getAllPoolsAsList = (start?: number, limit?: number): Promise<PoolInfo[]> => {
    return api.getAllPoolsAsList(this.ctx, start, limit);
  };

  /**
   * Return all pools as an Observable stream of PoolInfo objects.
   * @param count the max poolId to include before closing the stream if undefined then never close the stream
   * @returns An Observable stream of PoolInfo objects
   */
  getAllPoolsAsStream = (count?: number | undefined): Observable<PoolInfo> => {
    return api.getAllPoolsAsStream(this.ctx, count);
  };

  /**
   * Call an RPC instruction to create a new pool and initialize it's state setting the current payer to the pool admin.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolFees PoolFees to apply to the pool
   * @param cValue Compensation value
   * @param priceAccountX The pyth account that returns the USD price of the TokenX asset
   * @param priceAccountY The pyth account that returns the USD price of the TokenY asset
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  initializePoolState = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolFees: PoolFees,
    cValue?: number,
    priceAccountX?: PublicKey | undefined,
    priceAccountY?: PublicKey | undefined
  ): Promise<string> => {
    const method = await api.initializePoolState(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolFees,
      cValue,
      priceAccountX,
      priceAccountY
    );
    return method.rpc();
  };

  /**
   * Create a transaction that creates a new pool and initializes it's state setting the current payer to the pool admin.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolFees PoolFees to apply to the pool
   * @param cValue Compensation value
   * @param priceAccountX The pyth account that returns the USD price of the TokenX asset
   * @param priceAccountY The pyth account that returns the USD price of the TokenY asset
   * @returns A promise resolving to the Transaction
   */
  initializePoolStateTx = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolFees: PoolFees,
    cValue?: number,
    priceAccountX?: PublicKey | undefined,
    priceAccountY?: PublicKey | undefined
  ): Promise<Transaction> => {
    const method = await api.initializePoolState(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolFees,
      cValue,
      priceAccountX,
      priceAccountY
    );
    return method.transaction();
  };

  /**
   * Call an RPC instruction to initialize the LiquidityPools program.
   *
   * @remarks Can only be called by the programId's upgrade authority
   *
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  initializeGlobalState = async (): Promise<string> => {
    const method = await api.initializeGlobalState(this.ctx);
    return method.rpc();
  };

  /**
   * Create a transaction that initializes the LiquidityPools program.
   *
   * @returns A promise resolving to the Transaction of the instruction
   */
  initializeGlobalStateTx = async (): Promise<Transaction> => {
    const method = await api.initializeGlobalState(this.ctx);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to remove Liquidity from the pool.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId PoolId
   * @param lpTokensToBurn Number of liquidity provider tokens to deposit
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  removeLiquidity = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    lpTokensToBurn: bigint
  ): Promise<string> => {
    const method = await api.removeLiquidity(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      lpTokensToBurn
    );
    return method.rpc();
  };
  /**
   * Create a transaction that removes Liquidity from the pool.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId PoolId
   * @param lpTokensToBurn Number of liquidity provider tokens to deposit
   * @returns A promise resolving to the Transaction of the instruction
   */
  removeLiquidityTx = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    lpTokensToBurn: bigint
  ): Promise<Transaction> => {
    const method = await api.removeLiquidity(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      lpTokensToBurn
    );
    return method.transaction();
  };

  /**
   * Call an RPC instruction to set the cValue on the given pool.
   *
   * @remarks Can only be called by the pool admin. cValue must be one of 0, 100, 125 or 150.
   *
   * @param poolId The pool ID
   * @param cValue The c new value in basis points
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  setCValue = async (poolId: number, cValue: number): Promise<string> => {
    const method = await api.setCValue(this.ctx, poolId, cValue);
    return method.rpc();
  };

  /**
   * Create a transaction that sets the cValue on the given pool.
   *
   * @remarks Can only be called by the pool admin. cValue must be one of 0, 100, 125 or 150.
   *
   * @param poolId The pool ID
   * @param cValue The c new value in basis points
   * @returns A promise resolving to the Transaction of the instruction
   */
  setCValueTx = async (
    poolId: number,
    cValue: number
  ): Promise<Transaction> => {
    const method = await api.setCValue(this.ctx, poolId, cValue);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to set an admin feature on or off.
   *
   * @remarks Can only be called by the global admin
   *
   * @param featureType the feature to set either "swap", "add-liquidity", "remove-liquidity", "create-public-pool" or "all"
   * @param value true enables the feature false disables the feature
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  setFeature = async (
    featureType: FeatureType,
    value: boolean
  ): Promise<string> => {
    const method = await api.setFeature(this.ctx, featureType, value);
    return method.rpc();
  };

  /**
   * Creates a Transaction that sets an admin feature on or off.
   *
   * @param featureType the feature to set either "swap", "add-liquidity", "remove-liquidity", "create-public-pool" or "all"
   * @param value true enables the feature false disables the feature
   * @returns A promise resolving to the Transaction of the instruction
   */
  setFeatureTx = async (
    featureType: FeatureType,
    value: boolean
  ): Promise<Transaction> => {
    const method = await api.setFeature(this.ctx, featureType, value);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to set the fees on the given pool.
   *
   * @remarks Can only be called by the pool admin
   *
   * @param poolId Pool ID
   * @param fees fee object outlining the specific fee parameters for the pool
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  setFees = async (poolId: number, fees: OptionalPoolFees): Promise<string> => {
    const method = await api.setFees(this.ctx, poolId, fees);
    return method.rpc();
  };

  /**
   * Creates a Transaction that sets the fees on the given pool.
   *
   * @remarks Can only be called by the pool admin
   *
   * @param poolId Pool ID
   * @param fees fee object outlining the specific fee parameters for the pool
   * @returns A promise resolving to the Transaction of the instruction
   */
  setFeesTx = async (
    poolId: number,
    fees: OptionalPoolFees
  ): Promise<Transaction> => {
    const method = await api.setFees(this.ctx, poolId, fees);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to set pool limits on the given pool
   *
   * @remarks Can only be called by the pool admin
   *
   * @param poolId The pool ID for the pool to set the limits on
   * @param limits The Limits object to apply to the pool
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  setLimits = async (poolId: number, limits: Limits): Promise<string> => {
    const method = await api.setLimits(this.ctx, poolId, limits);
    return method.rpc();
  };

  /**
   * Create a Transaction that sets pool limits on the given pool
   *
   * @remarks Can only be called by the pool admin
   *
   * @param poolId The pool ID for the pool to set the limits on
   * @param limits The Limits object to apply to the pool
   * @returns A promise resolving to the Transaction of the instruction
   */
  setLimitsTx = async (
    poolId: number,
    limits: Limits
  ): Promise<Transaction> => {
    const method = await api.setLimits(this.ctx, poolId, limits);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to set the prices owner field on the global state.
   *
   * @remarks Can only be called by the global admin
   *
   * @param newOwner the new owners public key
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  setPricesOwner = async (newOwner: PublicKey): Promise<string> => {
    const method = await api.setPricesOwner(this.ctx, newOwner);
    return method.rpc();
  };

  /**
   * Create a Transaction to set the prices owner field on the global state.
   *
   * @param newOwner the new owners public key
   * @returns A promise resolving to the Transaction of the instruction
   */
  setPricesOwnerTx = async (newOwner: PublicKey): Promise<Transaction> => {
    const method = await api.setPricesOwner(this.ctx, newOwner);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to swap tokens with a pool.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId Pool ID of the given pool
   * @param userFromToken The user's own associated token account for the token the user is depositing to the pool.
   * @param userToToken The user's own associated token account for the token the user is recieving from the pool.
   * @param amountIn The number of tokens in the userFromToken account the user wishes to deposit.
   * @param minimumAmountOut The minimum number of tokens the user expects to receive in their userToToken account.
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  swap = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    userFromToken: PublicKey,
    userToToken: PublicKey,
    amountIn: bigint,
    minimumAmountOut: bigint
  ): Promise<string> => {
    const method = await api.swap(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      userFromToken,
      userToToken,
      amountIn,
      minimumAmountOut
    );
    return method.rpc();
  };
  /**
   * Create a Transaction to swap tokens with a pool.
   *
   * @param tokenXMint TokenX Mint public key
   * @param tokenYMint TokenY Mint public key
   * @param poolId Pool ID of the given pool
   * @param userFromToken The user's own associated token account for the token the user is depositing to the pool.
   * @param userToToken The user's own associated token account for the token the user is recieving from the pool.
   * @param amountIn The number of tokens in the userFromToken account the user wishes to deposit.
   * @param minimumAmountOut The minimum number of tokens the user expects to receive in their userToToken account.
   * @returns A promise resolving to the Transaction of the instruction
   */
  swapTx = async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number,
    userFromToken: PublicKey,
    userToToken: PublicKey,
    amountIn: bigint,
    minimumAmountOut: bigint
  ): Promise<Transaction> => {
    const method = await api.swap(
      this.ctx,
      tokenXMint,
      tokenYMint,
      poolId,
      userFromToken,
      userToToken,
      amountIn,
      minimumAmountOut
    );
    return method.transaction();
  };

  /**
   * Call an RPC instruction to transfer the global admin to another account.
   *
   * @remarks Can only be called by the global admin
   *
   * @param newAdmin the new account to transfer the global admin to.
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  transferGlobalAdmin = async (newAdmin: PublicKey): Promise<string> => {
    const method = await api.transferGlobalAdmin(this.ctx, newAdmin);
    return method.rpc();
  };

  /**
   * Create a Transaction to transfer the global admin to another account.
   *
   * @param newAdmin the new account to transfer the global admin to.
   * @returns A promise resolving to the Transaction of the instruction
   */
  transferGlobalAdminTx = async (newAdmin: PublicKey): Promise<Transaction> => {
    const method = await api.transferGlobalAdmin(this.ctx, newAdmin);
    return method.transaction();
  };

  /**
   * Call an RPC instruction to transfer the pool admin to another account.
   *
   * @remarks Can only be called by the pool admin of the given pool.
   *
   * @param poolId The pool ID of the pool
   * @param newAdmin the new account to transfer the pool admin to.
   * @returns A promise resolving to the Transaction receipt hash of the instruction
   */
  transferPoolAdmin = async (
    poolId: number,
    newAdmin: PublicKey
  ): Promise<string> => {
    const method = await api.transferPoolAdmin(this.ctx, poolId, newAdmin);
    return method.rpc();
  };

  /**
   * Create a Transaction to transfer the pool admin to another account.
   * @param poolId
   * @param newAdmin
   * @returns A promise resolving to the Transaction of the instruction
   */
  transferPoolAdminTx = async (
    poolId: number,
    newAdmin: PublicKey
  ): Promise<Transaction> => {
    const method = await api.transferPoolAdmin(this.ctx, poolId, newAdmin);
    return method.transaction();
  };

  /**
   * Create an instance of the LiquidityPools class with the given context and user wallet.
   * @param ctx the context.
   * @returns an instance of the LiquidityPools class
   */
  static fromCtx(ctx: Ctx): LiquidityPools {
    return new LiquidityPools(ctx, LiquidityPoolsAccountHelpers.fromCtx(ctx));
  }
}
