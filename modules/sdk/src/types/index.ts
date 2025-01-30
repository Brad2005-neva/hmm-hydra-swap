import { HydraLiquidityPools } from "@hydraprotocol/idls/codegen/types/hydra_liquidity_pools";
import { BN, Program, AnchorProvider } from "@project-serum/anchor";
import {
  Transaction,
  PublicKey,
  Connection,
  AccountInfo,
} from "@solana/web3.js";
import { HydraSDK, IAccountLoader } from "..";
import { PoolState } from "../liquidity-pools/types";
import { TokenMint } from "./token-mint";
export type { TokenAccount } from "./token-account";
export type { TokenMint };

export type PoolInfo = { key: PublicKey; info: PoolState };

/**
 * Interface for interacting with anchor's method builder.
 */
export type AnchorBuilderMethod = {
  transaction(): Promise<Transaction>;
  rpc(): Promise<string>;
};

export type Wallet = {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
};

export type ProgramIds = {
  hydraBenchmarks: string;
  hydraFaucet: string;
  hydraLiquidityPools: string;
};
export type Utils = {
  findAssociatedTokenAddress: (
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ) => Promise<PublicKey>;
  getExistingOwnerTokenAccount: (
    provider: AnchorProvider,
    mint: PublicKey
  ) => Promise<Option<PublicKey>>;
  getPDA: (
    programId: PublicKey,
    seeds: (string | number | PublicKey)[]
  ) => Promise<[PublicKey, number]>;
  isDefaultProvider: (provider: AnchorProvider) => boolean;
  isEqual: (a: PublicKey, b: PublicKey) => boolean;
  stringifyProps: <
    T extends Record<
      string,
      {
        toString: Function;
      }
    >
  >(
    obj: T
  ) => { [K in keyof T]: string };
  toBN: (amount: bigint) => BN;
  toBigInt: (amount: BN) => bigint;
  tryGet: <T>(fn: Promise<T>) => Promise<T | undefined>;
};
export interface Ctx {
  connection: Connection;
  wallet: Wallet;
  programs: {
    hydraLiquidityPools: Program<HydraLiquidityPools>;
  };
  provider: AnchorProvider;
  getKey: (name: keyof ProgramIds) => PublicKey;
  getParser: <T>(name: string) => (info: AccountInfo<Buffer>) => T;
  isSignedIn: () => boolean;
  network: Network;
  utils: Utils;
  log: (...strOrObjArr: Array<Record<string, any> | string>) => void;
}

export enum Network {
  MAINNET_BETA = "mainnet-beta",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCALNET = "localnet",
  FAKE_MAINNET = "fake-mainnet",
}

export type NetworkConfig = {
  programIds: ProgramIds;
};

export type NetworkMap = Record<Network, NetworkConfig>;

export type Asset = {
  balance?: bigint;
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
};

export type PromiseVal<T> = T extends Promise<infer J> ? J : never;
export type LiquidityPoolAccounts = PromiseVal<
  ReturnType<HydraSDK["liquidityPools"]["accounts"]["getAccountLoaders"]>
> & {
  tokenXMint: IAccountLoader<TokenMint>;
  tokenYMint: IAccountLoader<TokenMint>;
};

export type Option<T> = T | undefined;
