import { Keypair, PublicKey } from "@solana/web3.js";
import { Observable } from "rxjs";
import {
  AccountData,
  IAccountLoader,
  ITokenAccountLoader,
  Parser,
} from "../libs/account-loader";
import { Ctx, TokenAccount, TokenMint } from "../types";
import * as api from "./api";

export class CommonApi {
  constructor(private ctx: Ctx) {}
  createAssociatedAccount = (
    mint: PublicKey,
    owner?: Keypair,
    payer?: Keypair
  ): Promise<PublicKey> => {
    return api.createAssociatedAccount(this.ctx)(mint, owner, payer);
  };

  createMint = (
    mint?: Keypair,
    authority?: PublicKey | undefined,
    decimals?: number
  ): Promise<PublicKey> => {
    return api.createMint(this.ctx)(mint, authority, decimals);
  };

  createMintAndAssociatedVault = (
    mint: Keypair,
    amount: bigint,
    owner?: PublicKey | undefined,
    decimals?: number
  ): Promise<[PublicKey, PublicKey]> => {
    return api.createMintAndAssociatedVault(this.ctx)(
      mint,
      amount,
      owner,
      decimals
    );
  };
  createMintAndVault = (
    mint: Keypair,
    vault: Keypair | undefined,
    amount: bigint,
    owner?: PublicKey | undefined,
    decimals?: number
  ): Promise<[PublicKey, PublicKey]> => {
    return api.createMintAndVault(this.ctx)(
      mint,
      vault,
      amount,
      owner,
      decimals
    );
  };

  createTokenAccount = (
    mint: PublicKey,
    owner: PublicKey
  ): Promise<PublicKey> => {
    return api.createTokenAccount(this.ctx)(mint, owner);
  };

  toAccountLoader = <T>(
    parser: Parser<T>
  ): ((key: PublicKey) => IAccountLoader<T>) => {
    return api.toAccountLoader<T>(this.ctx)(parser);
  };

  toAssociatedTokenAccount = (
    mint: PublicKey,
    walletAddress?: PublicKey
  ): IAccountLoader<TokenAccount> & ITokenAccountLoader => {
    return api.toAssociatedTokenAccount(this.ctx)(mint, walletAddress);
  };

  toMintAccountLoader = (key: PublicKey): IAccountLoader<TokenMint> => {
    return api.toMintAccountLoader(this.ctx)(key);
  };

  toStream = (
    loader: IAccountLoader<any>
  ): Observable<AccountData<any> | undefined> => {
    return api.toStream(this.ctx)(loader);
  };

  toTokenAccountLoader = (
    key: PublicKey
  ): IAccountLoader<TokenAccount> & ITokenAccountLoader => {
    return api.toTokenAccountLoader(this.ctx)(key);
  };

  transfer = (
    from: PublicKey,
    to: PublicKey,
    amount: number | bigint,
    owner?: PublicKey,
    payer?: Keypair
  ): Promise<string> => {
    return api.transfer(this.ctx)(from, to, amount, owner, payer);
  };

  static fromCtx(ctx: Ctx): CommonApi {
    return new CommonApi(ctx);
  }
}
