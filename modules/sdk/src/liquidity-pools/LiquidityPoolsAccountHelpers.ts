import { PublicKey } from "@solana/web3.js";
import { IAccountLoader } from "../libs/account-loader";
import { Ctx } from "../types";
import * as accs from "./accounts";
import { LoaderFinder } from "./LoaderFinder";
import { GlobalState } from "./types";

/**
 * Liquidity pools account helpers
 */

export class LiquidityPoolsAccountHelpers {
  constructor(private ctx: Ctx) {}

  getLoaderFinder = (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number
  ): LoaderFinder => {
    return accs.getLoaderFinder(this.ctx)(tokenXMint, tokenYMint, poolId);
  };

  getAccountLoaders = (
    tokenXMint: PublicKey,
    tokenYMint: PublicKey,
    poolId: number
  ): Promise<accs.PoolAccountLoaders> => {
    return accs.getAccountLoaders(this.ctx)(tokenXMint, tokenYMint, poolId);
  };

  globalState = (): IAccountLoader<GlobalState> => {
    return accs.globalState(this.ctx)();
  };

  nextPoolId = (): Promise<number> => {
    return accs.nextPoolId(this.ctx)();
  };

  static fromCtx = (ctx: Ctx): LiquidityPoolsAccountHelpers => {
    return new LiquidityPoolsAccountHelpers(ctx);
  };
}
