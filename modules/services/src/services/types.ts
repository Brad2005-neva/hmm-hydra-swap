import { PublicKey } from "@solana/web3.js";
import {
  AccountData,
  Asset,
  PoolState,
  TokenAccount,
  TokenMint,
} from "@hydraprotocol/sdk";

export type AssetMap = Map<string, Asset>;
export type AssetPair = [Asset, Asset];

// Raw pool data we get from the raw pool list
export type PoolInfoItem = { key: PublicKey; info: PoolState };

// How we describe our pools as metadata
// We need to have tokenXMint and tokenYMint in
// order to derive all our pool addresses without loading
// any state from the accounts
export type PoolDescriptor = {
  poolId: number;
  tokenXMint: PublicKey;
  tokenYMint: PublicKey;
};

// How we describe our post fetch pool data
export type EnrichedPoolState = {
  poolState: AccountData<PoolState> | undefined;
  tokenXVault: AccountData<TokenAccount> | undefined;
  tokenYVault: AccountData<TokenAccount> | undefined;
  tokenXMint: AccountData<TokenMint> | undefined;
  tokenYMint: AccountData<TokenMint> | undefined;
  lpTokenMint: AccountData<TokenMint> | undefined;
  lpTokenAssociatedAccount: AccountData<TokenAccount> | undefined;
  isInitialized: boolean;
};

export type TxSuccessFn = (hash: string) => void;
export type TxFailureFn = (error: any) => void;
