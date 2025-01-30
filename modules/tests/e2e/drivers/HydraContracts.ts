import * as anchor from "@project-serum/anchor";
import { AnchorProvider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  HydraSDK,
  Network,
  getTokenList,
  parseJsonFees,
} from "@hydraprotocol/sdk";
import { loadKeySync } from "@hydraprotocol/sdk/node";
import { resolve } from "path";
import { UserTypes } from "../types";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { logMethodCalls } from "./logMethodCalls";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";

function getWalletFromTestUserAddress(address: string) {
  const keypair = loadKeySync(
    resolve(__dirname, `../../../../keys/users/${address}.json`)
  );
  return new NodeWallet(keypair);
}

const testAddressLookupTable = {
  treasury: "god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D",
  trader: "usrQpqgkvUjPgAVnGm8Dk3HmX3qXr1w4gLJMazLNyiW",
};

const fees = { ...parseJsonFees(feeDefaults), feeMinPct: 2000000000n };
// DEPRECATED: This should be deprecated in favour of using the cli API found under /modules/cli
export class HydraContracts {
  public sdk: HydraSDK;
  public provider: AnchorProvider;

  constructor(who: UserTypes) {
    const preflightCommitment = "recent";
    const connection = new anchor.web3.Connection(
      "http://127.0.0.1:8899",
      preflightCommitment
    );

    const address = testAddressLookupTable[who];
    const wallet = getWalletFromTestUserAddress(address);

    this.provider = new AnchorProvider(connection, wallet, {
      preflightCommitment,
      commitment: "confirmed",
      maxRetries: 10,
    });

    this.sdk = HydraSDK.fromAnchorProvider(this.provider, Network.LOCALNET);
  }

  static new(who: UserTypes) {
    return logMethodCalls(new HydraContracts(who));
  }

  async getSlot() {
    return this.provider.connection.getSlot();
  }

  async swap(
    fromToken: string,
    fromAmount: string,
    toToken: string,
    minToAmount: string,
    poolId: number
  ) {
    console.log("runSDKSwap");

    const assets = getTokenList(Network.LOCALNET);
    const wallet = this.provider.wallet;
    const fromTokenMint = assets.filter(
      (asset: any) => asset.symbol === fromToken
    )[0];
    const toTokenMint = assets.filter(
      (asset: any) => asset.symbol === toToken
    )[0];
    const fromTokenAssociated = this.sdk.accountLoaders.associatedToken(
      new PublicKey(fromTokenMint["address"]),
      wallet.publicKey
    );
    const toTokenAssociated = this.sdk.accountLoaders.associatedToken(
      new PublicKey(toTokenMint["address"]),
      wallet.publicKey
    );

    const fromAssociated = await fromTokenAssociated.key();
    const toAssociated = await toTokenAssociated.key();

    const tokenXMint = new PublicKey(fromTokenMint["address"]);
    const tokenYMint = new PublicKey(toTokenMint["address"]);

    try {
      await this.sdk.liquidityPools.swap(
        tokenXMint,
        tokenYMint,
        poolId,
        fromAssociated,
        toAssociated,
        BigInt(
          parseInt(
            (Number(fromAmount) * 10 ** fromTokenMint["decimals"]).toString()
          )
        ),
        BigInt(
          parseInt(
            (Number(minToAmount) * 10 ** toTokenMint["decimals"]).toString()
          )
        )
      );
    } catch (err: any) {
      console.log(err.toString());
    }

    console.log("SDK SWAP Finished");
  }

  async initializePool(
    tokenX: string,
    tokenY: string,
    cValue?: number,
    tokenXPriceAccount?: PublicKey,
    tokenYPriceAccount?: PublicKey
  ) {
    console.log("initializePool");

    const assets = getTokenList(Network.LOCALNET);

    const tokenXAsset = assets.filter(
      (asset: any) => asset.symbol === tokenX
    )[0];
    const tokenYAsset = assets.filter(
      (asset: any) => asset.symbol === tokenY
    )[0];

    const tokenXMint = new PublicKey(tokenXAsset["address"]);
    const tokenYMint = new PublicKey(tokenYAsset["address"]);

    const nextPoolId = await this.sdk.liquidityPools.accounts.nextPoolId();

    try {
      // Set prices owner in Global State
      const owner = new PublicKey(
        "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH"
      );
      await this.sdk.liquidityPools.setPricesOwner(owner);

      await this.sdk.liquidityPools.initializePoolState(
        tokenXMint,
        tokenYMint,
        fees,
        cValue,
        tokenXPriceAccount,
        tokenYPriceAccount
      );
    } catch (err: any) {
      console.log(err.toString());
    }
    console.log("initialized pool " + nextPoolId);
    console.log("SDK createPool Finished");
    return nextPoolId;
  }

  async createPool(
    tokenX: string,
    tokenXAmount: bigint,
    tokenY: string,
    tokenYAmount: bigint,
    cValue?: number,
    tokenXPriceAccount?: PublicKey,
    tokenYPriceAccount?: PublicKey
  ) {
    console.log("runSDKCreatePool");

    const assets = getTokenList(Network.LOCALNET);

    const tokenXAsset = assets.filter(
      (asset: any) => asset.symbol === tokenX
    )[0];
    const tokenYAsset = assets.filter(
      (asset: any) => asset.symbol === tokenY
    )[0];

    const tokenXMint = new PublicKey(tokenXAsset["address"]);
    const tokenYMint = new PublicKey(tokenYAsset["address"]);

    const nextPoolId = await this.sdk.liquidityPools.accounts.nextPoolId();

    try {
      // Set prices owner in Global State
      const owner = new PublicKey(
        "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH"
      );
      await this.sdk.liquidityPools.setPricesOwner(owner);

      await this.sdk.liquidityPools.initializePoolState(
        tokenXMint,
        tokenYMint,
        fees,
        cValue,
        tokenXPriceAccount,
        tokenYPriceAccount
      );

      await this.sdk.liquidityPools.addLiquidity(
        tokenXMint,
        tokenYMint,
        nextPoolId,
        tokenXAmount,
        tokenYAmount
      );
    } catch (err: any) {
      console.log(err.toString());
    }
    console.log("created pool " + nextPoolId);
    console.log("SDK createPool Finished");
    return nextPoolId;
  }
}
