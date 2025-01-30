import { Commitment, PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { Parser, IAccountLoader } from "./types";
import { getAccountStream } from "./get-account-stream";
import { getInfo } from "./info-queue";

// InternalAccountLoader
// Returns an account loader that is already initialized with a key
export function InternalAccountLoader<T>(
  _ctx: Ctx,
  _key: PublicKey,
  accountParser: Parser<T>
): IAccountLoader<T> {
  async function key() {
    return _key;
  }

  async function info(commitment?: Commitment) {
    const info = await getInfo(_key, _ctx.connection, commitment);
    if (info === null) {
      throw new Error("info couldnt be fetched for " + _key.toString());
    }

    return { ...info, data: accountParser(info) };
  }

  async function isInitialized() {
    try {
      const inf = await info();
      return !!inf;
    } catch (err) {
      return false;
    }
  }

  function stream(commitment?: Commitment) {
    return getAccountStream(_key, _ctx.connection, accountParser, commitment);
  }

  function onChange(callback: (info: T) => void, commitment: Commitment) {
    return stream(commitment).subscribe(
      (info) => info && callback(info.account.data)
    ).unsubscribe;
  }

  function ready() {
    return Promise.resolve();
  }
  function parser() {
    return accountParser;
  }
  function ctx() {
    return _ctx;
  }

  return {
    key,
    info,
    isInitialized,
    onChange,
    stream,
    ready,
    parser,
    ctx,
  };
}
