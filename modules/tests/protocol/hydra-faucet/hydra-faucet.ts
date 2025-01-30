import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import * as assert from "assert";

import { DEFAULT_FAUCET_AMOUNT, HydraFaucetSDK } from "@hydraprotocol/sdk";
import config from "@hydraprotocol/config/global-config.json";
import { resetState } from "@hydraprotocol/val";
import {
  createNewTester,
  getTokenInfoBySymbol,
  INIT_TOKEN_INFO,
  loadTokensInfoAndKeypair,
  TokenInfo,
} from "../utils";

describe("hydra-faucet", () => {
  // This whole describe block runs off the same state
  before(resetState("anchor-fixture"));

  let provider: anchor.AnchorProvider;

  let sdk: HydraFaucetSDK;
  let tokens: TokenInfo[] = INIT_TOKEN_INFO;
  const userWallets: Keypair[] = [];

  before(async () => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    sdk = HydraFaucetSDK.fromAnchorProvider(
      provider,
      config.localnet.programIds
    );

    // Load Localnet Token info & keypair
    tokens = await loadTokensInfoAndKeypair();

    // Create 3 user wallets
    for (let i = 0; i < 3; i++) {
      userWallets.push(await createNewTester(provider));
      assert.strictEqual(
        await provider.connection.getBalance(userWallets[i].publicKey),
        10000000000
      );
    }
    console.log(`3 tester wallets created successfully`);
  });

  it("should be setup all tokens in faucet contract", async () => {
    for (const idx in tokens) {
      // initialize
      const pubkey = tokens[idx].keypair.publicKey;
      await sdk.methods.initFaucet(tokens[idx].decimal, tokens[idx].keypair);
      tokens[idx].pubkey = pubkey;

      const faucetState = await sdk.accounts.faucetState(tokens[idx].pubkey);

      assert.ok(
        (await faucetState.data())?.data.tokenMint.equals(tokens[idx].pubkey),
        `Faucet Token mint mismatch for ${tokens[idx].pubkey.toBase58()}`
      );
      assert.equal(
        (await faucetState.data())?.data.tokenMintDecimals,
        tokens[idx].decimal
      );
    }
  });

  it("should get all created tokens from faucet contract", async () => {
    const tokenInfo = await sdk.utils.getAllCreatedTokens();

    tokenInfo.map((info) => {
      const matches = tokens.filter((token) =>
        token.pubkey.equals(info.pubkey)
      );
      assert.ok(
        matches.length > 0,
        `Faucet Token mint mismatch for ${info.pubkey.toBase58()}`
      );
      assert.equal(info.decimal, matches[0].decimal);
    });
  });

  it("should mint USDC tokens to first recipient for faucet", async () => {
    const usdTokenInfo = getTokenInfoBySymbol(tokens, "USDC");
    if (!usdTokenInfo) assert.ok(false, "Can't not find USDC token info");

    await sdk.methods.mintTokens(
      usdTokenInfo.pubkey,
      userWallets[0].publicKey,
      BigInt(DEFAULT_FAUCET_AMOUNT)
    );
    assert.strictEqual(
      await (
        await sdk.accounts.userToken(
          usdTokenInfo.pubkey,
          userWallets[0].publicKey
        )
      ).balance(),
      BigInt(DEFAULT_FAUCET_AMOUNT * 10 ** usdTokenInfo.decimal)
    );
  });

  it("should mint ETH, BTC tokens to second recipient for faucet", async () => {
    const ethTokenInfo = getTokenInfoBySymbol(tokens, "wETH");
    if (!ethTokenInfo) assert.ok(false, "Can't not find wETH token info");

    await sdk.methods.mintTokens(
      ethTokenInfo.pubkey,
      userWallets[1].publicKey,
      BigInt(DEFAULT_FAUCET_AMOUNT)
    );
    assert.strictEqual(
      await (
        await sdk.accounts.userToken(
          ethTokenInfo.pubkey,
          userWallets[1].publicKey
        )
      ).balance(),
      BigInt(DEFAULT_FAUCET_AMOUNT * 10 ** ethTokenInfo.decimal)
    );

    const btcTokenInfo = getTokenInfoBySymbol(tokens, "wBTC");
    if (!btcTokenInfo) assert.ok(false, "Can't not find wBTC token info");

    await sdk.methods.mintTokens(
      btcTokenInfo.pubkey,
      userWallets[1].publicKey,
      BigInt(DEFAULT_FAUCET_AMOUNT)
    );
    assert.strictEqual(
      await (
        await sdk.accounts.userToken(
          btcTokenInfo.pubkey,
          userWallets[1].publicKey
        )
      ).balance(),
      BigInt(DEFAULT_FAUCET_AMOUNT * 10 ** btcTokenInfo.decimal)
    );
  });

  it("should mint ETH tokens to third recipient for faucet", async () => {
    const ethTokenInfo = getTokenInfoBySymbol(tokens, "wETH");
    if (!ethTokenInfo) assert.ok(false, "Can't not find wETH token info");

    await sdk.methods.mintTokens(
      ethTokenInfo.pubkey,
      userWallets[2].publicKey,
      BigInt(DEFAULT_FAUCET_AMOUNT)
    );
    assert.strictEqual(
      await (
        await sdk.accounts.userToken(
          ethTokenInfo.pubkey,
          userWallets[2].publicKey
        )
      ).balance(),
      BigInt(DEFAULT_FAUCET_AMOUNT * 10 ** ethTokenInfo.decimal)
    );
  });
});
