import { PublicKey } from "@solana/web3.js";
import { GlobalState, PoolState } from "./types";
import { Ctx } from "../types";
import { AccountLoader, createPDAAccountLoader } from "../libs/account-loader";
import { TokenMint } from "../types/token-mint";
import { withTokenMethods } from "../libs/account-loader/utils";
import {
  PDAAccountLoader as PDAAccountLoaderType,
  TokenAccountLoader,
  PDATokenAccountLoader as PDATokenAccountLoaderType,
} from "./accounts";
import { KeyFinder } from "./KeyFinder";
import { Parsers } from "../parsers";

export type GetPdaFn = (
  programId: PublicKey,
  seeds: (PublicKey | string | number)[]
) => Promise<[PublicKey, number]>;

export type FindAtaFn = (
  wallet: PublicKey,
  mint: PublicKey
) => Promise<PublicKey>;

export class LoaderFinder {
  constructor(
    private ctx: Ctx,
    private keyfinder: KeyFinder,
    private parsers = Parsers.fromParserFactory(ctx.getParser)
  ) {}
  lpTokenMint = (): PDAAccountLoaderType<TokenMint> => {
    return createPDAAccountLoader(
      this.ctx,
      this.keyfinder.lpTokenMint,
      this.keyfinder.lpTokenMintBump,
      this.parsers.tokenMint()
    );
  };

  globalState = (): PDAAccountLoaderType<GlobalState> => {
    return createPDAAccountLoader(
      this.ctx,
      this.keyfinder.globalState,
      this.keyfinder.globalStateBump,
      this.parsers.globalState()
    );
  };

  poolState = (index?: number): PDAAccountLoaderType<PoolState> => {
    return createPDAAccountLoader(
      this.ctx,
      () => this.keyfinder.poolState(index),
      () => this.keyfinder.poolStateBump(index),
      this.parsers.poolState()
    );
  };

  tokenXVault = (): PDATokenAccountLoaderType => {
    return withTokenMethods(
      createPDAAccountLoader(
        this.ctx,
        this.keyfinder.tokenXVault,
        this.keyfinder.tokenXVaultBump,
        this.parsers.tokenAccount()
      )
    );
  };

  tokenYVault = (): PDATokenAccountLoaderType => {
    return withTokenMethods(
      createPDAAccountLoader(
        this.ctx,
        this.keyfinder.tokenYVault,
        this.keyfinder.tokenYVaultBump,
        this.parsers.tokenAccount()
      )
    );
  };

  lpTokenVault = (): PDATokenAccountLoaderType => {
    return withTokenMethods(
      createPDAAccountLoader(
        this.ctx,
        this.keyfinder.lpTokenVault,
        this.keyfinder.lpTokenVaultBump,
        this.parsers.tokenAccount()
      )
    );
  };

  userTokenX = (): TokenAccountLoader => {
    return withTokenMethods(
      AccountLoader(
        this.ctx,
        this.keyfinder.userTokenX,
        this.parsers.tokenAccount()
      )
    );
  };

  userTokenY = (): TokenAccountLoader => {
    return withTokenMethods(
      AccountLoader(
        this.ctx,
        this.keyfinder.userTokenY,
        this.parsers.tokenAccount()
      )
    );
  };

  lpTokenAssociatedAccount = (): TokenAccountLoader => {
    return withTokenMethods(
      AccountLoader(
        this.ctx,
        this.keyfinder.lpTokenAssociatedAccount,
        this.parsers.tokenAccount()
      )
    );
  };

  static new(ctx: Ctx, finder: KeyFinder) {
    return new LoaderFinder(ctx, finder);
  }

  static fromCtx(
    ctx: Ctx,
    poolId?: number,
    tokenXMint?: PublicKey,
    tokenYMint?: PublicKey
  ) {
    return new LoaderFinder(
      ctx,
      KeyFinder.fromCtx(ctx, poolId, tokenXMint, tokenYMint)
    );
  }
}
