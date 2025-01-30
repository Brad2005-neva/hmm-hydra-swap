import { PublicKey } from "@solana/web3.js";
import {
  LP_TOKEN_VAULT_SEED,
  POOL_STATE_SEED,
  TOKEN_VAULT_SEED,
  LP_TOKEN_MINT_SEED,
  GLOBAL_STATE_SEED,
} from "../config/constants";
import { Ctx } from "../types";
import memoize from "./utils";
import { GetPdaFn, FindAtaFn } from "./LoaderFinder";

export type KeyFinderDump = {
  poolId: number;
  tokenXMint: string;
  tokenYMint: string;
  lpTokenMint: string;
  globalState: string;
  poolState: string;
  tokenXVault: string;
  tokenYVault: string;
  lpTokenVault: string;
  userTokenX: string;
  userTokenY: string;
  lpTokenAssociatedAccount: string;
};

export class KeyFinder {
  private getPDA: GetPdaFn;
  private findAta: FindAtaFn;

  constructor(
    getPDA: GetPdaFn,
    findAta: FindAtaFn,
    private programId: PublicKey,
    private user: PublicKey,
    private poolId?: number,
    private tokenXMint?: PublicKey,
    private tokenYMint?: PublicKey
  ) {
    // We memoize these functions so we aren't finding too many PDA keys
    this.getPDA = memoize(getPDA);
    this.findAta = memoize(findAta);
  }

  private poolStatePDA = async (index?: number) => {
    const poolId = index ?? this.poolId;
    if (typeof poolId === "undefined") throw new Error("need poolId or index");
    return await this.getPDA(this.programId, [POOL_STATE_SEED, poolId]);
  };

  private lpTokenMintPDA = async () => {
    const poolState = await this.poolState();
    return await this.getPDA(this.programId, [LP_TOKEN_MINT_SEED, poolState]);
  };

  private globalStatePDA = async () => {
    return await this.getPDA(this.programId, [GLOBAL_STATE_SEED]);
  };

  private tokenXVaultPDA = async () => {
    if (!this.tokenXMint) throw new Error("need tokenXMint");

    const tokenXMint = this.tokenXMint;
    const poolState = await this.poolState();
    return await this.getPDA(this.programId, [
      TOKEN_VAULT_SEED,
      tokenXMint,
      poolState,
    ]);
  };

  private tokenYVaultPDA = async () => {
    if (!this.tokenYMint) throw new Error("need tokenYMint");

    const poolState = await this.poolState();
    const tokenYMint = this.tokenYMint;
    return await this.getPDA(this.programId, [
      TOKEN_VAULT_SEED,
      tokenYMint,
      poolState,
    ]);
  };

  private lpTokenVaultPDA = async () => {
    const lpTokenMint = await this.lpTokenMint();
    return await this.getPDA(this.programId, [
      LP_TOKEN_VAULT_SEED,
      lpTokenMint,
    ]);
  };

  lpTokenMint = async () => {
    const [key] = await this.lpTokenMintPDA();
    return key;
  };

  lpTokenMintBump = async () => {
    const [, bump] = await this.lpTokenMintPDA();
    return bump;
  };

  globalState = async () => {
    const [key] = await this.globalStatePDA();
    return key;
  };

  globalStateBump = async () => {
    const [, bump] = await this.globalStatePDA();
    return bump;
  };

  poolState = async (index?: number) => {
    const [key] = await this.poolStatePDA(index);
    return key;
  };

  poolStateBump = async (index?: number) => {
    const [, bump] = await this.poolStatePDA(index);
    return bump;
  };

  tokenXVault = async () => {
    const [key] = await this.tokenXVaultPDA();
    return key;
  };

  tokenXVaultBump = async () => {
    const [, bump] = await this.tokenXVaultPDA();
    return bump;
  };

  tokenYVault = async () => {
    const [key] = await this.tokenYVaultPDA();
    return key;
  };

  tokenYVaultBump = async () => {
    const [, bump] = await this.tokenYVaultPDA();
    return bump;
  };

  lpTokenVault = async () => {
    const [key] = await this.lpTokenVaultPDA();
    return key;
  };

  lpTokenVaultBump = async () => {
    const [, bump] = await this.lpTokenVaultPDA();
    return bump;
  };

  userTokenX = async () => {
    if (!this.tokenXMint) throw new Error("need tokenXMint");

    return await this.findAta(this.user, this.tokenXMint);
  };

  userTokenY = async () => {
    if (!this.tokenYMint) throw new Error("need tokenYMint");

    return await this.findAta(this.user, this.tokenYMint);
  };

  lpTokenAssociatedAccount = async () => {
    const lpTokenMint = await this.lpTokenMint();
    return await this.findAta(this.user, lpTokenMint);
  };

  async dump(): Promise<KeyFinderDump> {
    if (
      typeof this.poolId === "undefined" ||
      !this.tokenXMint ||
      !this.tokenYMint
    )
      throw new Error(
        "Need to specify poolId, tokenXMint, and tokenYMint in order to dump keys."
      );

    return {
      poolId: this.poolId,
      tokenXMint: `${this.tokenXMint}`,
      tokenYMint: `${this.tokenYMint}`,
      lpTokenMint: `${await this.lpTokenMint()}`,
      globalState: `${await this.globalState()}`,
      poolState: `${await this.poolState()}`,
      tokenXVault: `${await this.tokenXVault()}`,
      tokenYVault: `${await this.tokenYVault()}`,
      lpTokenVault: `${await this.lpTokenVault()}`,
      userTokenX: `${await this.userTokenX()}`,
      userTokenY: `${await this.userTokenY()}`,
      lpTokenAssociatedAccount: `${await this.lpTokenAssociatedAccount()}`,
    };
  }

  static fromCtx(
    ctx: Ctx,
    poolId?: number,
    tokenXMint?: PublicKey,
    tokenYMint?: PublicKey
  ) {
    return new KeyFinder(
      ctx.utils.getPDA,
      ctx.utils.findAssociatedTokenAddress,
      ctx.programs.hydraLiquidityPools.programId,
      ctx.wallet.publicKey,
      poolId,
      tokenXMint,
      tokenYMint
    );
  }
}
