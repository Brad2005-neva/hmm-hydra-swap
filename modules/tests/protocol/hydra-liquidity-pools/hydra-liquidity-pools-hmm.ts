import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { INIT_TOKEN_INFO, LIQUIDITY_MINIMUM } from "../constants";
import { prepareTestPoolInfo } from "../utils";
import { HydraSDK, Network, PoolFees } from "@hydraprotocol/sdk";
import assert from "assert";
import { resetState } from "@hydraprotocol/val";
import fixtures from "../fixtures/index.json";
import testData from "../fixtures/e2e_integrated.json";

describe("hydra-liquidity-pool-hmm", () => {
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
  let tokenXVaultBalance: bigint = 0n;

  let tokenYVault: PublicKey;
  let tokenYVaultBalance: bigint = 0n;

  let tokenXVaultBump: number;
  let tokenYVaultBump: number;

  let lpTokenBalance: bigint = 0n;

  let poolFees: PoolFees;

  const priceAccountSOL = new PublicKey(fixtures.sol_usd.priceAccount);
  const priceAccountUSD = new PublicKey(fixtures.usdc_usd.priceAccount);

  before(async () => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    sdk = HydraSDK.fromAnchorProvider(provider, Network.LOCALNET);

    const tokenX = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "wSOL"
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
    (scenario) => scenario.description === "HMM anchor end to end"
  )[0];

  it("should not initialize a liquidity-pool without a price owner set", async () => {
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.initializePoolState(
          tokenXMint,
          tokenYMint,
          poolFees,
          150,
          priceAccountSOL,
          priceAccountUSD
        ),
      /AccountOwnedByWrongProgram/
    );
  });

  it("should not initialize a liquidity-pool with a cValue not in approved range", async () => {
    const owner = new PublicKey("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
    await sdk.liquidityPools.setPricesOwner(owner);

    await assert.rejects(
      async () =>
        await sdk.liquidityPools.initializePoolState(
          tokenXMint,
          tokenYMint,
          poolFees,
          60,
          priceAccountSOL,
          priceAccountUSD
        ),
      /InvalidCValue/
    );
  });

  it("should not initialize a liquidity-pool with invalid pyth accounts", async () => {
    const owner = new PublicKey("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
    await sdk.liquidityPools.setPricesOwner(owner);

    await assert.rejects(
      async () =>
        await sdk.liquidityPools.initializePoolState(
          tokenXMint,
          tokenYMint,
          poolFees,
          150,
          Keypair.generate().publicKey, // spoofed price x account
          Keypair.generate().publicKey // spoofed price y account
        ),
      /AccountOwnedByWrongProgram/
    );
  });

  it("should not initialize a liquidity-pool missing pyth accounts", async () => {
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.initializePoolState(
          tokenXMint,
          tokenYMint,
          poolFees,
          150
        ),
      /OracleAccountsMissing/
    );
  });

  it("should initialize a liquidity-pool with valid pyth accounts", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees,
      150,
      priceAccountSOL,
      priceAccountUSD
    );

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(
      poolStateAccount.admin.toString(),
      provider.wallet.publicKey.toString()
    );
    assert.equal(
      poolStateAccount.tokenXVault.toString(),
      tokenXVault.toString()
    );
    assert.equal(
      poolStateAccount.tokenYVault.toString(),
      tokenYVault.toString()
    );

    assert.equal(poolStateAccount.tokenXMint.toString(), tokenXMint.toString());
    assert.equal(poolStateAccount.tokenYMint.toString(), tokenYMint.toString());
    assert.equal(
      poolStateAccount.lpTokenMint.toString(),
      (await accounts.lpTokenMint.key()).toString()
    );
    assert.equal(poolStateAccount.tokenXVaultBump, tokenXVaultBump);
    assert.equal(poolStateAccount.tokenYVaultBump, tokenYVaultBump);
  });

  it("should add-liquidity for the first time", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees,
      150,
      priceAccountSOL,
      priceAccountUSD
    );

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
    }

    assert.strictEqual(
      await accounts.lpTokenVault.balance(),
      LIQUIDITY_MINIMUM
    );

    lpTokenBalance = lpTokenBalance + BigInt(test.expected.liquidity);
    assert.strictEqual(
      await accounts.lpTokenAssociatedAccount.balance(),
      lpTokenBalance
    );

    userTokenXBalance = userTokenXBalance - BigInt(test.add.xAmount);
    assert.strictEqual(await accounts.userTokenX.balance(), userTokenXBalance);

    userTokenYBalance = userTokenYBalance - BigInt(test.add.yAmount);
    assert.strictEqual(await accounts.userTokenY.balance(), userTokenYBalance);

    tokenXVaultBalance = tokenXVaultBalance + BigInt(test.add.xAmount);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      tokenXVaultBalance
    );

    tokenYVaultBalance = tokenYVaultBalance + BigInt(test.add.yAmount);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      tokenYVaultBalance
    );
  });

  it("should swap x to y", async () => {
    const test_fee = scenario.fee[0];
    const test = scenario.swap[0];

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees,
      150,
      priceAccountSOL,
      priceAccountUSD
    );

    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        BigInt(test_fee.amount),
        BigInt(test.expected.deltaY)
      );
    } catch (err: any) {
      console.log(err);
    }

    userTokenXBalance = userTokenXBalance - BigInt(test_fee.amount);
    assert.strictEqual(await accounts.userTokenX.balance(), userTokenXBalance);

    userTokenYBalance = userTokenYBalance + BigInt(test.expected.deltaY);
    assert.strictEqual(await accounts.userTokenY.balance(), userTokenYBalance);

    tokenXVaultBalance = tokenXVaultBalance + BigInt(test_fee.amount);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      tokenXVaultBalance
    );

    tokenYVaultBalance = tokenYVaultBalance - BigInt(test.expected.deltaY);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      tokenYVaultBalance
    );
  });

  it("should able to change compensation of pool as pool admin", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees,
      150,
      priceAccountSOL,
      priceAccountUSD
    );

    let poolStateInfo = await accounts.poolState.info();
    let poolStateAccount = poolStateInfo.data;

    assert.equal(
      poolStateAccount.admin.toString(),
      provider.wallet.publicKey.toString()
    );
    assert.equal(
      poolStateAccount.tokenXVault.toString(),
      tokenXVault.toString()
    );
    assert.equal(
      poolStateAccount.tokenYVault.toString(),
      tokenYVault.toString()
    );

    assert.equal(poolStateAccount.tokenXMint.toString(), tokenXMint.toString());
    assert.equal(poolStateAccount.tokenYMint.toString(), tokenYMint.toString());
    assert.equal(
      poolStateAccount.lpTokenMint.toString(),
      (await accounts.lpTokenMint.key()).toString()
    );
    assert.equal(poolStateAccount.tokenXVaultBump, tokenXVaultBump);
    assert.equal(poolStateAccount.tokenYVaultBump, tokenYVaultBump);

    assert.equal(poolStateAccount.cValue, 150);

    await sdk.liquidityPools.setCValue(poolId, 100);

    poolStateInfo = await accounts.poolState.info();
    poolStateAccount = poolStateInfo.data;

    assert.equal(
      poolStateAccount.admin.toString(),
      provider.wallet.publicKey.toString()
    );

    assert.equal(poolStateAccount.cValue, 100);
  });

  it("should not able to set compensation of invalid range", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(
      poolStateAccount.admin.toString(),
      provider.wallet.publicKey.toString()
    );

    assert.equal(poolStateAccount.cValue, 100);

    await assert.rejects(
      async () => await sdk.liquidityPools.setCValue(poolId, 60),
      /InvalidCValue/
    );
  });

  it("should not able to set fees of invalid range", async () => {
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.setFees(poolId, {
          feeCalculation: "Percent",
          feeMinPct: BigInt(200_000_000_000_000n),
        }),
      /InvalidFee/
    );

    await assert.rejects(
      async () =>
        await sdk.liquidityPools.setFees(poolId, {
          feeCalculation: "VolatilityAdjusted",
          feeMinPct: BigInt(2_000_000_000_000n),
          feeMaxPct: BigInt(200_000_000_000_000n),
        }),
      /InvalidFee/
    );
  });

  it("should able to set fees of percent feeCalculation", async () => {
    await sdk.liquidityPools.setFees(poolId, {
      feeCalculation: "Percent",
      feeMinPct: BigInt(2_000_000_000_000n),
    });

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(poolStateAccount.fees.feeCalculation, "Percent");
    assert.equal(
      poolStateAccount.fees.feeMinPct.toString(),
      BigInt(2_000_000_000_000n).toString()
    );
  });

  it("should able to set fees of volatility adjusted feeCalculation", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.setFees(poolId, {
      feeCalculation: "VolatilityAdjusted",
      feeMinPct: BigInt(2_000_000_000_000n),
      feeMaxPct: BigInt(20_000_000_000_000n),
      feeVelocity: BigInt(100_000n),
    });

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(poolStateAccount.fees.feeCalculation, "VolatilityAdjusted");
    assert.equal(
      poolStateAccount.fees.feeMinPct.toString(),
      BigInt(2_000_000_000_000n).toString()
    );
    assert.equal(
      poolStateAccount.fees.feeMaxPct.toString(),
      BigInt(20_000_000_000_000n).toString()
    );
    assert.equal(
      poolStateAccount.fees.feeLastEwma.toString(),
      BigInt(178_367_580n).toString()
    );
    assert.equal(
      poolStateAccount.fees.feeEwmaWindow.toString(),
      BigInt(3_600_000_000_000_000n).toString()
    );
    assert.equal(
      poolStateAccount.fees.feeLambda.toString(),
      BigInt(545_000_000_000n).toString()
    );
    assert.equal(
      poolStateAccount.fees.feeVelocity.toString(),
      BigInt(100_000n).toString()
    );
  });

  it("should not able to change compensation of pool after transfer pool admin", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const newAdminWallet = Keypair.generate();

    await sdk.liquidityPools.transferPoolAdmin(
      poolId,
      newAdminWallet.publicKey
    );

    const poolStateInfo = await accounts.poolState.info();
    const poolStateAccount = poolStateInfo.data;

    assert.equal(
      poolStateAccount.admin.toString(),
      newAdminWallet.publicKey.toString()
    );

    assert.equal(poolStateAccount.cValue, 100);

    await assert.rejects(
      async () => await sdk.liquidityPools.setCValue(poolId, 150),
      /InvalidPoolAdmin/
    );
  });

  it("should not able to change fees of pool after transfer pool admin", async () => {
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.setFees(poolId, {
          feeCalculation: "Percent",
          feeMinPct: 1_000_000_000n,
        }),
      /InvalidPoolAdmin/
    );
  });
});
