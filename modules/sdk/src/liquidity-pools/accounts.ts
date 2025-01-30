import { PublicKey } from "@solana/web3.js";
import {
  GlobalState,
  IAccountLoader,
  IPDAAccountLoader,
  ITokenAccountLoader,
  PoolState,
  TokenAccount,
  TokenMint,
} from "..";
import { Ctx } from "../types";
import { LoaderFinder } from "./LoaderFinder";

export const getLoaderFinder =
  (ctx: Ctx) =>
  (tokenXMint: PublicKey, tokenYMint: PublicKey, poolId: number) => {
    return LoaderFinder.fromCtx(ctx, poolId, tokenXMint, tokenYMint);
  };

export type PDAAccountLoader<T> = IAccountLoader<T> & IPDAAccountLoader;
export type PDATokenAccountLoader = IAccountLoader<TokenAccount> &
  IPDAAccountLoader &
  ITokenAccountLoader;
export type TokenAccountLoader = IAccountLoader<TokenAccount> &
  ITokenAccountLoader;

export type MintAccountLoader = IAccountLoader<TokenMint> & ITokenAccountLoader;

export type PDAMintAccountLoader = IAccountLoader<TokenMint> &
  IPDAAccountLoader;

export type PoolAccountLoaders = {
  globalState: PDAAccountLoader<GlobalState>;
  poolState: PDAAccountLoader<PoolState>;
  tokenXVault: PDATokenAccountLoader;
  tokenYVault: PDATokenAccountLoader;
  lpTokenVault: PDATokenAccountLoader;
  lpTokenMint: PDAMintAccountLoader;
  userTokenX: TokenAccountLoader;
  userTokenY: TokenAccountLoader;
  lpTokenAssociatedAccount: TokenAccountLoader;
};

export const getAccountLoaders =
  (ctx: Ctx) =>
  async (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number
  ): Promise<PoolAccountLoaders> => {
    const finder = LoaderFinder.fromCtx(ctx, poolId, tokenXMint, tokenYMint);

    const lpTokenMint = finder.lpTokenMint();
    const globalState = finder.globalState();
    const poolState = finder.poolState();
    const tokenXVault = finder.tokenXVault();
    const tokenYVault = finder.tokenYVault();
    const lpTokenVault = finder.lpTokenVault();
    const userTokenX = finder.userTokenX();
    const userTokenY = finder.userTokenY();
    const lpTokenAssociatedAccount = finder.lpTokenAssociatedAccount();

    return {
      globalState,
      poolState,
      tokenXVault,
      tokenYVault,
      lpTokenVault,
      lpTokenMint,
      userTokenX,
      userTokenY,
      lpTokenAssociatedAccount,
    };
  };

export const globalState = (ctx: Ctx) => () => {
  return LoaderFinder.fromCtx(ctx).globalState();
};

export const nextPoolId = (ctx: Ctx) => async () => {
  const globalStateLoader = LoaderFinder.fromCtx(ctx).globalState();
  const globalStateInfo = await globalStateLoader.info();
  return globalStateInfo.data.poolCount;
};
