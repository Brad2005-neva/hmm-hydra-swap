/* eslint-disable @typescript-eslint/no-unused-vars */
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { INIT_TOKEN_INFO } from "../constants";
import { prepareTestPoolInfo } from "../utils";
import { HydraSDK, Network } from "@hydraprotocol/sdk";
import { PoolFees } from "@hydraprotocol/sdk";
import { Limits } from "@hydraprotocol/sdk";
import assert from "assert";
import { resetState } from "@hydraprotocol/val";
import testData from "../fixtures/e2e_integrated.json";

describe("hydra-liquidity-pool-limits", () => {
  before(resetState("anchor-fixture"));

  let provider: anchor.AnchorProvider;
  let sdk: HydraSDK;

  let tokenXMint: PublicKey;
  let tokenXUserAccount: PublicKey;
  let userTokenXBalance: bigint;

  let tokenYMint: PublicKey;
  let tokenYUserAccount: PublicKey;
  let userTokenYBalance: bigint;

  const poolId: number = 0;

  let tokenXVault: PublicKey;

  let tokenYVault: PublicKey;

  let tokenXVaultBump: number;
  let tokenYVaultBump: number;

  let poolFees: PoolFees;

  before(async () => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    sdk = HydraSDK.fromAnchorProvider(provider, Network.LOCALNET);

    const tokenX = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "wETH"
    )[0];
    const tokenY = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "USDC"
    )[0];

    const testPoolInfo = await prepareTestPoolInfo(
      poolId,
      tokenX.initialAmount,
      tokenX.decimals,
      tokenY.initialAmount,
      tokenY.decimals,
      sdk
    );

    tokenXMint = testPoolInfo.xMint;
    tokenXUserAccount = testPoolInfo.xAccount;
    userTokenXBalance = tokenX.initialAmount;

    tokenYMint = testPoolInfo.yMint;
    tokenYUserAccount = testPoolInfo.yAccount;
    userTokenYBalance = tokenY.initialAmount;

    tokenXVault = testPoolInfo.tokenXVault;
    tokenXVaultBump = testPoolInfo.tokenXVaultBump;

    tokenYVault = testPoolInfo.tokenYVault;
    tokenYVaultBump = testPoolInfo.tokenYVaultBump;

    poolFees = testPoolInfo.poolFees;

    await sdk.liquidityPools.initializeGlobalState();
  });

  const scenario = testData.filter(
    (scenario) => scenario.description === "AMM anchor end to end"
  )[0];

  it("should initialize a liquidity-pool with limits and constraints", async () => {
    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees
    );

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 200_000000000n,
      liquidityTokenYMax: 3000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(poolStateAccount.limits.enabled, true);
    assert.equal(poolStateAccount.limits.liquidityTokenXMax, 200_000000000n);
    assert.equal(poolStateAccount.limits.liquidityTokenYMax, 3000_000000n);
    assert.equal(poolStateAccount.limits.swapTokenXMax, 5_000000000n);
    assert.equal(poolStateAccount.limits.swapTokenYMax, 100_000000n);
  });

  it("should fail to add-liquidity to pool for the first time due to limits on token X", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees
    );

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 3000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.addLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.add.xAmount),
        BigInt(test.add.yAmount),
        slippage
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for liquidity instruction token X";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should fail to add-liquidity to pool for the first time due to limits on token Y", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees
    );

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 200_000000000n,
      liquidityTokenYMax: 2000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.addLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.add.xAmount),
        BigInt(test.add.yAmount),
        slippage
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for liquidity instruction token Y";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should add-liquidity to pool for the first time within limits", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 200_000000000n,
      liquidityTokenYMax: 3000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.addLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.add.xAmount),
        BigInt(test.add.yAmount),
        slippage
      );
    } catch (err: any) {
      console.log(err);
      assert.ok(false, "Error was thrown");
    }
    assert.ok(true, "No error was thrown");
  });

  it("should fail to remove-liquidity from the pool due to limits on token X", async () => {
    const test = scenario.liquidity[2];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 10_000000000n,
      liquidityTokenYMax: 2000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for liquidity instruction token X";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should fail to remove-liquidity from the pool due to limits on token Y", async () => {
    const test = scenario.liquidity[2];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 1000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for liquidity instruction token Y";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should remove-liquidity within limits", async () => {
    const test = scenario.liquidity[2];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 2000_000000n,
      swapTokenXMax: 5_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);
    try {
      await sdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
    } catch (err: any) {
      console.log(err);
      assert.ok(false, "Error was thrown");
    }
    assert.ok(true, "No error was thrown");
  });

  it("should fail to swap x to y due to limits on token X", async () => {
    const test_fee = scenario.fee[0];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 1000_000000n,
      swapTokenXMax: 1_000000000n,
      swapTokenYMax: 100_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        BigInt(test_fee.amount),
        BigInt(0n)
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for swap instruction token X";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should fail to swap x to y due to limits on token Y", async () => {
    const test_fee = scenario.fee[0];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 1000_000000n,
      swapTokenXMax: 10_000000000n,
      swapTokenYMax: 1_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        BigInt(test_fee.amount),
        BigInt(0n)
      );
      assert.ok(false, "No error was thrown");
    } catch (err: any) {
      const errMsg = "Limits exceeded for swap instruction token Y";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should swap x to y within limits", async () => {
    const test_fee = scenario.fee[0];

    const limits: Limits = {
      enabled: true,
      liquidityTokenXMax: 100_000000000n,
      liquidityTokenYMax: 1000_000000n,
      swapTokenXMax: 50_000000000n,
      swapTokenYMax: 500_000000n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        BigInt(test_fee.amount),
        BigInt(0n)
      );
    } catch (err: any) {
      console.log(err);
      assert.ok(false, "Error was thrown");
    }
    assert.ok(true, "No error was thrown");
  });

  it("should ignore limits when disabled", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    const limits: Limits = {
      enabled: false,
      liquidityTokenXMax: 0n,
      liquidityTokenYMax: 0n,
      swapTokenXMax: 0n,
      swapTokenYMax: 0n,
    };

    await sdk.liquidityPools.setLimits(poolId, limits);

    try {
      await sdk.liquidityPools.addLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.add.xAmount),
        BigInt(test.add.yAmount),
        slippage
      );
    } catch (err: any) {
      console.log(err);
      assert.ok(false, "Error was thrown");
    }
    assert.ok(true, "No error was thrown");
  });
});
