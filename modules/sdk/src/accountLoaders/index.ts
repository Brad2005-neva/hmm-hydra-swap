import { PublicKey } from "@solana/web3.js";
import { IAccountLoader, Parser } from "../libs/account-loader";
import { TokenAccountLoader } from "../liquidity-pools";
import { Ctx, TokenMint } from "../types";
import * as api from "./api";

/**
 * A function to create an account loader
 */
export type AccountLoaderFactory<T> = (key: PublicKey) => IAccountLoader<T>;

/**
 * Utility for quickly creating new account loader
 */
export class AccountLoaders {
  constructor(private ctx: Ctx) {}

  account = <T>(parser: Parser<T>): AccountLoaderFactory<T> => {
    return api.account<T>(this.ctx)(parser);
  };

  associatedToken = (
    mint: PublicKey,
    walletAddress?: PublicKey
  ): TokenAccountLoader => {
    return api.associatedToken(this.ctx)(mint, walletAddress);
  };

  mint = (key: PublicKey): IAccountLoader<TokenMint> => {
    return api.mint(this.ctx)(key);
  };

  mintOfToken = (
    loader: TokenAccountLoader
  ): Promise<IAccountLoader<TokenMint>> => {
    return api.mintOfToken(this.ctx)(loader);
  };

  token = (key: PublicKey): TokenAccountLoader => {
    return api.token(this.ctx)(key);
  };

  static fromCtx(ctx: Ctx) {
    return new AccountLoaders(ctx);
  }
}
