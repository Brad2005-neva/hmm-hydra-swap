import * as anchor from "@project-serum/anchor";
import assert from "assert";
import { PublicKey } from "@solana/web3.js";
import { createNewClientProvider } from "@hydraprotocol/utils-solana";
import { INIT_TOKEN_INFO } from "../constants";
import { prepareTestPoolInfo } from "../utils";
import { FeatureType, HydraSDK, Network } from "@hydraprotocol/sdk";
import { resetState } from "@hydraprotocol/val";

describe("hydra-liquidity-global", () => {
  before(resetState("anchor-fixture"));

  let provider1: anchor.AnchorProvider;
  let provider2: anchor.AnchorProvider;
  let sdk1: HydraSDK;
  let sdk2: HydraSDK;

  let tokenXMint: PublicKey;
  let tokenYMint: PublicKey;
  const poolId: number = 0;

  before(async () => {
    provider1 = anchor.AnchorProvider.env();
    anchor.setProvider(provider1);

    sdk1 = HydraSDK.fromAnchorProvider(provider1, Network.LOCALNET);

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
      sdk1
    );

    tokenXMint = testPoolInfo.xMint;
    tokenYMint = testPoolInfo.yMint;
  });

  it("should not initialize global state PDA without program deployer authority", async () => {
    provider2 = await createNewClientProvider(sdk1, provider1.connection);
    sdk2 = HydraSDK.fromAnchorProvider(provider2, Network.LOCALNET);

    await assert.rejects(
      async () => await sdk2.liquidityPools.initializeGlobalState(),
      /InvalidDeployer/
    );
  });

  it("should initialize global state PDA of a liquidity-pool", async () => {
    const accounts = await sdk1.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk1.liquidityPools.initializeGlobalState();

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(
      globalStateAccount.admin.toString(),
      provider1.wallet.publicKey.toString()
    );
    assert.equal(globalStateAccount.swapDisabled, false);
    assert.equal(globalStateAccount.addLiquidityDisabled, false);
    assert.equal(globalStateAccount.removeLiquidityDisabled, false);
    assert.equal(globalStateAccount.createPublicPoolsDisabled, true);
  });

  it("should set the owner of the prices account", async () => {
    const accounts = await sdk1.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    const owner = new PublicKey("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
    await sdk1.liquidityPools.setPricesOwner(owner);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.pricesOwner.toString(), owner.toString());
  });

  it("should fail to transfer ownership because the payer is not admin", async () => {
    const clientProvider = await createNewClientProvider(
      sdk1,
      provider1.connection
    );

    const clientSdk = HydraSDK.fromAnchorProvider(
      clientProvider,
      Network.LOCALNET
    );

    await assert.rejects(
      async () =>
        await clientSdk.liquidityPools.transferGlobalAdmin(
          provider1.wallet.publicKey
        ),
      /InvalidGlobalAdmin/
    );
  });

  it("should transfer global admin of a liquidity-pool to provider2", async () => {
    const accounts = await sdk1.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk1.liquidityPools.transferGlobalAdmin(provider2.wallet.publicKey);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(
      globalStateAccount.admin.toString(),
      provider2.wallet.publicKey.toString()
    );
  });

  it("should fail to set feature because the payer (provider1) is no longer admin", async () => {
    await assert.rejects(
      async () => await sdk1.liquidityPools.setFeature(FeatureType.All, true),
      /InvalidGlobalAdmin/
    );
  });

  it("should freeze all feature of a liquidity-pool as provider2", async () => {
    sdk2 = HydraSDK.fromAnchorProvider(provider2, Network.LOCALNET);

    const accounts = await sdk2.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk2.liquidityPools.setFeature(FeatureType.All, true);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.swapDisabled, true);
    assert.equal(globalStateAccount.addLiquidityDisabled, true);
    assert.equal(globalStateAccount.removeLiquidityDisabled, true);
    assert.equal(globalStateAccount.createPublicPoolsDisabled, true);
  });

  it("should unfreeze create pool feature of a liquidity-pool as provider2", async () => {
    const accounts = await sdk2.liquidityPools.accounts.getAccountLoaders(
      tokenXMint,
      tokenYMint,
      poolId
    );

    await sdk2.liquidityPools.setFeature(FeatureType.CreatePublicPools, false);

    const globalStateInfo = await accounts.globalState.info();
    const globalStateAccount = globalStateInfo.data;

    assert.equal(globalStateAccount.createPublicPoolsDisabled, false);
    assert.equal(globalStateAccount.swapDisabled, true);
    assert.equal(globalStateAccount.addLiquidityDisabled, true);
    assert.equal(globalStateAccount.removeLiquidityDisabled, true);
  });
});
