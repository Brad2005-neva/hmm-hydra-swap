import * as anchor from "@project-serum/anchor";
import assert from "assert";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { INIT_TOKEN_INFO, LIQUIDITY_MINIMUM } from "../constants";
import { HydraSDK, FeatureType, PoolFees, Network } from "@hydraprotocol/sdk";
import { toBN } from "@hydraprotocol/sdk";
import * as SPLToken from "@solana/spl-token";
import { web3 } from "@project-serum/anchor";
import { resetState } from "@hydraprotocol/val";
import { prepareTestPoolInfo } from "../utils";
import testData from "../fixtures/e2e_integrated.json";
import { createNewClientProvider } from "@hydraprotocol/utils-solana";

describe("hydra-liquidity-pool-amm", () => {
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

  it("should fail create pool as non-global admin because create public pool is disabled by default", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.createPublicPoolsDisabled, true);
    assert.equal(globalStateAccount.swapDisabled, false);
    assert.equal(globalStateAccount.addLiquidityDisabled, false);
    assert.equal(globalStateAccount.removeLiquidityDisabled, false);

    const provider2 = await createNewClientProvider(sdk, provider.connection);
    const sdk2 = HydraSDK.fromAnchorProvider(provider2, Network.LOCALNET);

    await assert.rejects(
      async () =>
        await sdk2.liquidityPools.initializePoolState(
          tokenXMint,
          tokenYMint,
          poolFees
        ),
      /CreatePublicPoolDisabled/
    );
  });

  it("should initialize a liquidity-pool as global admin even create public pool is disabled", async () => {
    await sdk.liquidityPools.initializePoolState(
      tokenXMint,
      tokenYMint,
      poolFees
    );

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

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

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

  it("should add-liquidity for the second time", async () => {
    const test = scenario.liquidity[1];
    const slippage = 1_000n; // 1%

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

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
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

  it("should remove-liquidity for the first time", async () => {
    const test = scenario.liquidity[2];

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    try {
      await sdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
    } catch (err: any) {
      console.log(err);
    }

    lpTokenBalance = lpTokenBalance - BigInt(test.expected.liquidity);
    assert.strictEqual(
      await accounts.lpTokenAssociatedAccount.balance(),
      lpTokenBalance
    );

    userTokenXBalance = userTokenXBalance + BigInt(test.expected.xAmount);
    assert.strictEqual(await accounts.userTokenX.balance(), userTokenXBalance);

    userTokenYBalance = userTokenYBalance + BigInt(test.expected.yAmount);
    assert.strictEqual(await accounts.userTokenY.balance(), userTokenYBalance);

    tokenXVaultBalance = tokenXVaultBalance - BigInt(test.expected.xAmount);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      tokenXVaultBalance
    );

    tokenYVaultBalance = tokenYVaultBalance - BigInt(test.expected.yAmount);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      tokenYVaultBalance
    );
  });

  it("should fail token swap due to slippage error", async () => {
    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        1_000000n,
        37_000_000000n
      );
      assert.ok(false);
    } catch (err: any) {
      const errMsg = "Slippage Amount Exceeded";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should fail token swap due to underlying math error", async () => {
    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        0n,
        0n
      );
      assert.ok(false);
    } catch (err: any) {
      const errMsg = "Fees are greater than input amount";
      assert(err.toString().includes(errMsg));
    }
  });

  it("should swap x to y", async () => {
    const test_fee = scenario.fee[0];
    const test = scenario.swap[0];

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

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

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

  it("should swap y to x", async () => {
    const test_fee = scenario.fee[1];
    const test = scenario.swap[1];

    try {
      await sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenYUserAccount,
        tokenXUserAccount,
        BigInt(test_fee.amount),
        BigInt(test.expected.deltaX)
      );
    } catch (err: any) {
      console.log(err);
    }

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    userTokenXBalance = userTokenXBalance + BigInt(test.expected.deltaX);
    assert.strictEqual(await accounts.userTokenX.balance(), userTokenXBalance);

    userTokenYBalance = userTokenYBalance - BigInt(test_fee.amount);
    assert.strictEqual(await accounts.userTokenY.balance(), userTokenYBalance);

    tokenXVaultBalance = tokenXVaultBalance - BigInt(test.expected.deltaX);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      tokenXVaultBalance
    );

    tokenYVaultBalance = tokenYVaultBalance + BigInt(test_fee.amount);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      tokenYVaultBalance
    );
  });

  it("should swap x to y for a third party wallet", async () => {
    const test_fee = scenario.fee[0];
    const test = scenario.swap[2];

    const newUserWallet = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        newUserWallet.publicKey,
        10_000_000_000
      ),
      "confirmed"
    );

    assert.strictEqual(
      await provider.connection.getBalance(newUserWallet.publicKey),
      10_000_000_000
    );

    const newTokenXUserAccount = await sdk.common.createAssociatedAccount(
      tokenXMint,
      newUserWallet
    );

    const newTokenYUserAccount = await sdk.common.createAssociatedAccount(
      tokenYMint,
      newUserWallet
    );

    await sdk.common.transfer(
      tokenXUserAccount,
      newTokenXUserAccount,
      100_000000000n
    );

    await sdk.common.transfer(
      tokenYUserAccount,
      newTokenYUserAccount,
      100_000000n
    );

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    try {
      await sdk.ctx.programs.hydraLiquidityPools.methods
        .swap(toBN(BigInt(test_fee.amount)), toBN(BigInt(test.expected.deltaY)))
        .accounts({
          user: newUserWallet.publicKey,
          tokenXMint: tokenXMint,
          tokenYMint: tokenYMint,
          globalState: await accounts.globalState.key(),
          poolState: await accounts.poolState.key(),
          lpTokenMint: await accounts.lpTokenMint.key(),
          userFromToken: newTokenXUserAccount,
          userToToken: newTokenYUserAccount,
          userToMint: tokenYMint,
          tokenXVault: await accounts.tokenXVault.key(),
          tokenYVault: await accounts.tokenYVault.key(),
          systemProgram: SystemProgram.programId,
          tokenProgram: SPLToken.TOKEN_PROGRAM_ID,
          associatedTokenProgram: SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([newUserWallet])
        .rpc({ commitment: "confirmed" });
    } catch (err: any) {
      console.log(err);
    }

    userTokenXBalance = userTokenXBalance - 100_000000000n;
    const newUserTokenXBalance = 100_000000000n - BigInt(test_fee.amount);
    assert.strictEqual(
      await sdk.accountLoaders.token(newTokenXUserAccount).balance(),
      newUserTokenXBalance
    );

    userTokenYBalance = userTokenYBalance - 100_000000n;
    const newUserTokenYBalance = 100_000000n + BigInt(test.expected.deltaY);
    assert.strictEqual(
      await sdk.accountLoaders.token(newTokenYUserAccount).balance(),
      newUserTokenYBalance
    );

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

  it("should remove-liquidity for the last time", async () => {
    const test = scenario.liquidity[3];

    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    try {
      await sdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
    } catch (err: any) {
      console.log(err);
    }

    lpTokenBalance = lpTokenBalance - BigInt(test.expected.liquidity);
    assert.strictEqual(
      await accounts.lpTokenAssociatedAccount.balance(),
      lpTokenBalance
    );

    userTokenXBalance = userTokenXBalance + BigInt(test.expected.xAmount);
    assert.strictEqual(await accounts.userTokenX.balance(), userTokenXBalance);

    userTokenYBalance = userTokenYBalance + BigInt(test.expected.yAmount);
    assert.strictEqual(await accounts.userTokenY.balance(), userTokenYBalance);

    tokenXVaultBalance = tokenXVaultBalance - BigInt(test.expected.xAmount);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      tokenXVaultBalance
    );

    tokenYVaultBalance = tokenYVaultBalance - BigInt(test.expected.yAmount);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      tokenYVaultBalance
    );
  });

  it("should fail to remove-liquidity insufficient funds", async () => {
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.removeLiquidity(
          tokenXMint,
          tokenYMint,
          poolId,
          BigInt(1000_000000n)
        ),
      /Liquidity to be removed greater than mint total supply/
    );
  });

  it("should fail all features after freeze all", async () => {
    const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk.liquidityPools.setFeature(FeatureType.All, true);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.createPublicPoolsDisabled, true);
    assert.equal(globalStateAccount.swapDisabled, true);
    assert.equal(globalStateAccount.addLiquidityDisabled, true);
    assert.equal(globalStateAccount.removeLiquidityDisabled, true);

    await assert.rejects(
      async () =>
        await sdk.liquidityPools.swap(
          tokenXMint,
          tokenYMint,
          poolId,
          tokenXUserAccount,
          tokenYUserAccount,
          1_000000n,
          37_000_000000n
        ),
      /SwapDisabled/
    );

    const test = scenario.liquidity[3];
    await assert.rejects(
      async () =>
        await sdk.liquidityPools.removeLiquidity(
          tokenXMint,
          tokenYMint,
          poolId,
          BigInt(test.remove.liquidity)
        ),
      /RemoveLiquidityDisabled/
    );
  });
});
