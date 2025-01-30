import { PublicKey, AccountInfo } from "@solana/web3.js";
import { Ctx } from "../..";
import {
  AccountLoader,
  AssociatedToken,
  IAccountLoader,
  Mint,
  Token,
} from "../../libs/account-loader";

type Parser<T> = (info: AccountInfo<Buffer>) => T;
export function toAccountLoader<T>(ctx: Ctx) {
  return (parser: Parser<T>) => (key: PublicKey) =>
    AccountLoader(ctx, key, parser);
}

export function toAssociatedTokenAccount(ctx: Ctx) {
  return (mint: PublicKey, walletAddress = ctx.wallet.publicKey) =>
    AssociatedToken(ctx, mint, walletAddress);
}

export function toMintAccountLoader(ctx: Ctx) {
  return (key: PublicKey) => Mint(ctx, key);
}

export function toTokenAccountLoader(ctx: Ctx) {
  return (key: PublicKey) => Token(ctx, key);
}

export function toStream(_: Ctx) {
  return <T extends IAccountLoader<any>>(loader: T) => loader.stream();
}
