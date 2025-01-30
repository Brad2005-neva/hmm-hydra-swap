import { AccountLayout, MintLayout } from "@solana/spl-token";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { Parser } from "..";
import { GlobalState, PoolState } from "../liquidity-pools/types";
import { TokenAccount, TokenMint } from "../types";
import {
  parsePriceData,
  parseProductData,
  PriceData,
  ProductData,
} from "@pythnetwork/client";

export type ParserFactory = <T>(name: string) => Parser<T>;

export class Parsers {
  constructor(private getParser: ParserFactory) {}

  globalState = (): Parser<GlobalState> => {
    return this.getParser<GlobalState>("GlobalState");
  };

  poolState = (): Parser<PoolState> => {
    return this.getParser<PoolState>("PoolState");
  };

  tokenMint = (): Parser<TokenMint> => {
    return (info: AccountInfo<Buffer>): TokenMint => {
      return MintLayout.decode(info.data);
    };
  };

  tokenAccount = (): Parser<TokenAccount> => {
    return (info: AccountInfo<Buffer>): TokenAccount => {
      const raw = AccountLayout.decode(info.data);

      return {
        mint: new PublicKey(raw.mint),
        owner: new PublicKey(raw.owner),
        amount: raw.amount,
        delegateOption: raw.delegateOption,
        delegate: new PublicKey(raw.delegate),
        state: raw.state,
        isNativeOption: raw.isNativeOption,
        isNative: raw.isNative,
        delegatedAmount: raw.delegatedAmount,
        closeAuthorityOption: raw.closeAuthorityOption,
        closeAuthority: new PublicKey(raw.closeAuthority),
      };
    };
  };

  pythPriceData = (): Parser<PriceData> => {
    return (info: AccountInfo<Buffer>) => {
      return parsePriceData(info.data);
    };
  };

  parseProductData = (): Parser<ProductData> => {
    return (info: AccountInfo<Buffer>) => {
      return parseProductData(info.data);
    };
  };

  static fromParserFactory(parserFactory: ParserFactory) {
    return new Parsers(parserFactory);
  }
}
