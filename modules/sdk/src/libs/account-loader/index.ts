import { PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { findAssociatedTokenAddress } from "../../utils";
import * as TokenMint from "../../types/token-mint";
import { withBump, withoutBump, withTokenMethods } from "./utils";
import { Getter, IAccountLoader, Parser } from "./types";
import { AccountLoader as AsyncAccountLoader } from "./account-loader";
import {
  PDAAccountLoader,
  PDAMintAccountLoader,
  PDATokenAccountLoader,
  TokenAccountLoader,
} from "../../liquidity-pools";
import { Parsers } from "../../parsers";

export const AccountLoader = AsyncAccountLoader.create;

export * from "./types";

export type KeyOrGetter = Getter<PublicKey> | PublicKey;
export function createPDAAccountLoader<T>(
  ctx: Ctx,
  getKey: () => Promise<PublicKey>,
  getBump: () => Promise<number>,
  parser: Parser<T>
): PDAAccountLoader<T> {
  const loader = AsyncAccountLoader.create(ctx, getKey, parser);
  return {
    ...loader,
    bump: getBump,
  };
}

export function createPDAToken(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[]
): PDATokenAccountLoader {
  const parsers = Parsers.fromParserFactory(ctx.getParser);
  return withTokenMethods(PDA(ctx, programId, seeds, parsers.tokenAccount()));
}

export type PDATokenLoader = ReturnType<typeof createPDAToken>;

export function Token(ctx: Ctx, getter: KeyOrGetter): TokenAccountLoader {
  const parsers = Parsers.fromParserFactory(ctx.getParser);
  return withTokenMethods(
    AsyncAccountLoader.create(ctx, getter, parsers.tokenAccount())
  );
}

export type TokenLoader = ReturnType<typeof Token>;

export function Mint(
  ctx: Ctx,
  getter: KeyOrGetter
): IAccountLoader<TokenMint.TokenMint> {
  const parsers = Parsers.fromParserFactory(ctx.getParser);

  return AsyncAccountLoader.create(ctx, getter, parsers.tokenMint());
}

export type MintLoader = ReturnType<typeof Mint>;

export function PDAMint(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[]
): PDAMintAccountLoader {
  const parsers = Parsers.fromParserFactory(ctx.getParser);

  return PDA(ctx, programId, seeds, parsers.tokenMint());
}

export type PDAMintLoader = ReturnType<typeof PDAMint>;

export function AssociatedToken(
  ctx: Ctx,
  mint: PublicKey,
  walletAddress = ctx.wallet.publicKey
): TokenAccountLoader {
  return Token(ctx, () => findAssociatedTokenAddress(walletAddress, mint));
}
export type AssociatedTokenLoader = ReturnType<typeof AssociatedToken>;

export function PDA<T>(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[],
  parser: Parser<T>
): PDAAccountLoader<T> {
  return withBump(
    () => ctx.utils.getPDA(programId, seeds),
    (keyGetter) => AsyncAccountLoader.create<T>(ctx, keyGetter, parser)
  );
}

export function PDAFromKey<T>(
  ctx: Ctx,
  key: PublicKey,
  parser: Parser<T>
): IAccountLoader<T> {
  return withoutBump(key, () => AsyncAccountLoader.create<T>(ctx, key, parser));
}

export type PDALoader = ReturnType<typeof PDA>;
