import * as anchor from "@project-serum/anchor";
import assert from "assert";
import {
  airdrop,
  initializeSymbolWithAmount,
} from "@hydraprotocol/utils-solana";

import { PublicKey } from "@solana/web3.js";
import { INIT_TOKEN_INFO } from "../constants";
import { prepareTestPoolInfo } from "../utils";
import {
  getTokenList,
  HydraSDK,
  parseJsonFees,
  Network,
} from "@hydraprotocol/sdk";
import { resetState } from "@hydraprotocol/val";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";

describe("hydra-liquidity-pool-links", () => {
  beforeEach(resetState("anchor-fixture"));

  let sdk: HydraSDK;
  const fees = { ...parseJsonFees(feeDefaults), feeMinPct: 2000000000n };
  const assets = getTokenList(Network.LOCALNET);

  beforeEach(async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    sdk = HydraSDK.fromAnchorProvider(provider, Network.LOCALNET);
    const wallet = (sdk.ctx.provider.wallet as any).payer;
    await airdrop(sdk, wallet.publicKey, 1_000_000_000);
  });

  it("should initialize a liquidity-pool", async () => {
    const tokenX = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "wBTC"
    )[0];
    const tokenY = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "USDC"
    )[0];
    const poolId: number = 0;

    const testPoolInfo = await prepareTestPoolInfo(
      poolId,
      tokenX.initialAmount,
      tokenX.decimals,
      tokenY.initialAmount,
      tokenY.decimals,
      sdk
    );

    const tokenXMint = testPoolInfo.xMint;
    const tokenYMint = testPoolInfo.yMint;
    const poolFees = testPoolInfo.poolFees;

    await sdk.liquidityPools.initializeGlobalState();

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

    assert.equal(poolStateAccount.poolId, 0);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.poolCount, 1);
  });

  it("should initialize two liquidity-pools", async () => {
    const tokenX = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "wBTC"
    )[0];
    const tokenY = INIT_TOKEN_INFO.filter(
      (token) => token.symbol === "USDC"
    )[0];
    const firstPoolId: number = 0;

    const firstPoolInfo = await prepareTestPoolInfo(
      firstPoolId,
      tokenX.initialAmount,
      tokenX.decimals,
      tokenY.initialAmount,
      tokenY.decimals,
      sdk
    );

    const firstPoolXMint = firstPoolInfo.xMint;
    const firstPoolYMint = firstPoolInfo.yMint;
    const firstPoolFees = firstPoolInfo.poolFees;

    await sdk.liquidityPools.initializeGlobalState();

    await sdk.liquidityPools.initializePoolState(
      firstPoolXMint,
      firstPoolYMint,
      firstPoolFees
    );

    const firstAccounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      firstPoolXMint,
      firstPoolYMint,
      firstPoolId
    );

    const firstPoolStateInfo = await firstAccounts.poolState.info();
    const firstPoolStateAccount = firstPoolStateInfo.data;

    assert.equal(firstPoolStateAccount.poolId, firstPoolId);

    const firstGlobalStateInfo = await firstAccounts.globalState.info();
    const firstGlobalStateAccount = firstGlobalStateInfo.data;

    assert.equal(firstGlobalStateAccount.poolCount, 1);

    const secondPoolId: number = 1;

    const secondPoolInfo = await prepareTestPoolInfo(
      secondPoolId,
      tokenX.initialAmount,
      tokenX.decimals,
      tokenY.initialAmount,
      tokenY.decimals,
      sdk
    );

    const secondPoolXMint = secondPoolInfo.xMint;
    const secondPoolYMing = secondPoolInfo.yMint;
    const secondPoolFees = secondPoolInfo.poolFees;

    const secondAccounts = await sdk.liquidityPools.accounts.getAccountLoaders(
      secondPoolXMint,
      secondPoolYMing,
      secondPoolId
    );

    await sdk.liquidityPools.initializePoolState(
      secondPoolXMint,
      secondPoolYMing,
      secondPoolFees
    );

    const secondPoolStateInfo = await secondAccounts.poolState.info();
    const secondPoolStateAccount = secondPoolStateInfo.data;

    assert.equal(secondPoolStateAccount.poolId, secondPoolId);

    const secondGlobalStateInfo = await secondAccounts.globalState.info();
    const secondGlobalStateAccount = secondGlobalStateInfo.data;
    assert.equal(secondGlobalStateAccount.poolCount, 2);
  });

  it("should be impossible to create pools immediately after deployment", async () => {
    const tokenXSymbol = "USDC";
    const tokenYSymbol = "wBTC";

    const [tokenXAsset] = assets.filter(
      ({ symbol }) => symbol === tokenXSymbol
    );
    const [tokenYAsset] = assets.filter(
      ({ symbol }) => symbol === tokenYSymbol
    );

    const tokenXMint = new PublicKey(tokenXAsset.address);
    const tokenYMint = new PublicKey(tokenYAsset.address);

    await initializeSymbolWithAmount(sdk, tokenXSymbol, 100000000000000n);
    await initializeSymbolWithAmount(sdk, tokenYSymbol, 100000000000000n);

    try {
      await sdk.liquidityPools.initializePoolState(
        tokenXMint,
        tokenYMint,
        fees
      );
      assert.ok(false, "No error was thrown when expected");
    } catch (err: any) {
      const errMsg = "info couldnt be fetched for";
      assert(err.toString().includes(errMsg));
    }
  });
});
