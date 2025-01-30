import * as anchor from "@project-serum/anchor";
import assert from "assert";
import { HydraSDK, Network, Token } from "@hydraprotocol/sdk";
import {
  airdrop,
  initializeSymbolWithAmount,
  initializePool,
  transferFromPayer,
} from "@hydraprotocol/utils-solana";
import * as SPLToken from "@solana/spl-token";
import { resetState } from "@hydraprotocol/val";
import { PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import Tokens from "@hydraprotocol/config/tokens.json";
import { INIT_TOKEN_INFO } from "../constants";
import testData from "../fixtures/e2e_integrated.json";

describe("hydra-liquidity-pool-with-sol", () => {
  before(resetState("anchor-fixture"));

  let provider: anchor.AnchorProvider;
  let sdk: HydraSDK;
  let demoAccount: Keypair;
  let userProvider: anchor.AnchorProvider;
  let userSdk: HydraSDK;
  const poolId: number = 0;
  let tokenXMint: PublicKey;
  let tokenXUserAccount: PublicKey;
  let tokenYMint: PublicKey;
  let tokenYUserAccount: PublicKey;
  let userTokenXBalance: bigint = BigInt(200_000000000); // 200 SOL
  let userTokenYBalance: bigint = BigInt(5_000_000_000000); // 5M USDC
  let lpTokenBalance: bigint = 0n;
  let tokenXBalance: bigint = 0n;
  let tokenYBalance: bigint = 0n;

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

    const wallet = (sdk.ctx.provider.wallet as any).payer;
    await airdrop(sdk, wallet.publicKey, 1_000000000);

    await initializeSymbolWithAmount(sdk, tokenY.symbol, 100_000_000_000000n);

    await sdk.liquidityPools.initializeGlobalState();

    await initializePool(sdk, tokenX.symbol, tokenY.symbol);

    demoAccount = Keypair.generate();

    userProvider = new anchor.AnchorProvider(
      sdk.ctx.connection,
      new anchor.Wallet(demoAccount),
      anchor.AnchorProvider.defaultOptions()
    );

    userSdk = HydraSDK.fromAnchorProvider(userProvider, Network.LOCALNET);

    await airdrop(sdk, demoAccount.publicKey, Number(userTokenXBalance));
    await transferFromPayer(sdk, demoAccount, "USDC", userTokenYBalance);

    tokenXMint = SPLToken.NATIVE_MINT;

    const usdcAsset = Tokens["localnet"].find(
      (asset: Token) => asset.symbol.toLowerCase() === "usdc"
    );
    if (!usdcAsset) {
      console.log("Asset not found");
      return;
    }

    tokenYMint = new PublicKey(usdcAsset.address);

    tokenXUserAccount = await SPLToken.getAssociatedTokenAddress(
      tokenXMint,
      demoAccount.publicKey
    );

    tokenYUserAccount = await SPLToken.getAssociatedTokenAddress(
      tokenYMint,
      demoAccount.publicKey
    );
  });

  const scenario = testData.filter(
    (scenario) => scenario.description === "SOL anchor end to end"
  )[0];

  it("should add-liquidity (wSOL, USDC)", async () => {
    const test = scenario.liquidity[0];
    const slippage = 0n; // 0%

    try {
      await userSdk.liquidityPools.addLiquidity(
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

    const accounts = await userSdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    lpTokenBalance = lpTokenBalance + BigInt(test.expected.liquidity);
    assert.strictEqual(
      await accounts.lpTokenAssociatedAccount.balance(),
      lpTokenBalance
    );

    const demoAccountInfo = await sdk.ctx.provider.connection.getAccountInfo(
      demoAccount.publicKey
    );

    userTokenXBalance =
      userTokenXBalance - BigInt(test.add.xAmount) - BigInt(2_044_280); // - gas fee
    if (demoAccountInfo)
      assert.strictEqual(BigInt(demoAccountInfo.lamports), userTokenXBalance);

    const USDCAccount = await SPLToken.getAssociatedTokenAddress(
      tokenYMint,
      demoAccount.publicKey
    );

    userTokenYBalance = userTokenYBalance - BigInt(test.add.yAmount);
    assert.strictEqual(
      await sdk.accountLoaders.token(USDCAccount).balance(),
      userTokenYBalance
    );

    tokenXBalance = tokenXBalance + BigInt(test.add.xAmount);
    assert.strictEqual(
      await accounts.tokenXVault.balance(),
      BigInt(test.add.xAmount)
    );

    tokenYBalance = tokenYBalance + BigInt(test.add.yAmount);
    assert.strictEqual(
      await accounts.tokenYVault.balance(),
      BigInt(test.add.yAmount)
    );
  });

  it("should remove-liquidity (wSOL, USDC)", async () => {
    const test = scenario.liquidity[1];

    try {
      await userSdk.liquidityPools.removeLiquidity(
        tokenXMint,
        tokenYMint,
        poolId,
        BigInt(test.remove.liquidity)
      );
    } catch (err: any) {
      console.log(err);
    }

    const accounts = await userSdk.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    lpTokenBalance = lpTokenBalance - BigInt(test.expected.liquidity);
    assert.strictEqual(
      await accounts.lpTokenAssociatedAccount.balance(),
      lpTokenBalance
    );

    const demoAccountInfo = await sdk.ctx.provider.connection.getAccountInfo(
      demoAccount.publicKey
    );

    userTokenXBalance =
      userTokenXBalance + BigInt(test.expected.xAmount) - BigInt(5_000); // gas fee
    if (demoAccountInfo)
      assert.strictEqual(BigInt(demoAccountInfo.lamports), userTokenXBalance);

    const USDCAccount = await SPLToken.getAssociatedTokenAddress(
      tokenYMint,
      demoAccount.publicKey
    );

    userTokenYBalance = userTokenYBalance + BigInt(test.expected.yAmount);
    assert.strictEqual(
      await sdk.accountLoaders.token(USDCAccount).balance(),
      userTokenYBalance
    );

    tokenXBalance = tokenXBalance - BigInt(test.expected.xAmount);
    assert.strictEqual(await accounts.tokenXVault.balance(), tokenXBalance);

    tokenYBalance = tokenYBalance - BigInt(test.expected.yAmount);
    assert.strictEqual(await accounts.tokenYVault.balance(), tokenYBalance);
  });

  it("should fail token swap due to no enough SOL (wSOL -> USDC)", async () => {
    try {
      await userSdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        userTokenXBalance + BigInt(1_000000000),
        BigInt(0)
      );
      assert.ok(false);
    } catch (err: any) {
      const errMsg = "Transfer: insufficient lamports"; // InsufficientFunds
      assert(err.logs?.join("").includes(errMsg));
    }
  });

  it("should swap wSOL to USD (x to y)", async () => {
    try {
      await userSdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenXUserAccount,
        tokenYUserAccount,
        userTokenXBalance,
        BigInt(0)
      );
    } catch (err: any) {
      console.log(err);
    }
    assert.ok(true);
  });

  it("should swap USD to wSOL (y to x)", async () => {
    try {
      await userSdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        tokenYUserAccount,
        tokenXUserAccount,
        userTokenYBalance,
        BigInt(0)
      );
    } catch (err: any) {
      console.log(err);
    }
    assert.ok(true);
  });
});
