import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js";
import { Observable } from "rxjs";
import { MintLoader } from ".";
import { Ctx } from "../..";

export type PDAKey = [PublicKey, number];
export type Getter<T> = () => Promise<T>;
export type Unsubscriber = () => void;
export type ReadyObservable<T> = Observable<T> & {
  ready: () => Promise<Observable<T>>;
};
export type AccountData<T> = { pubkey: PublicKey; account: AccountInfo<T> };
export type AccountStream<T> = Observable<AccountData<T>>;

/**
 * Interface for loading solana accounts
 */
export interface IAccountLoader<T> {
  /**
   * Fetch the key for the account
   */
  key(): Promise<PublicKey>;

  /**
   * Return when the key has been fetched and the account is ready
   */
  ready(): Promise<void>;

  /**
   * Fetch the info for the account
   * @param commitment Solana commitment
   */
  info(commitment?: Commitment): Promise<AccountInfo<T>>;

  /**
   * Return whether the account is initialized
   */
  isInitialized(): Promise<boolean>;

  /**
   * Return the parser for the account
   */
  parser(): Parser<T>;

  /**
   * Return the context that this AccountLoader was created with
   */
  ctx(): Ctx;

  /**
   * Return an Observable stream of account data values to keep track of changes
   * @param commitment
   */
  stream(commitment?: Commitment): Observable<AccountData<T> | undefined>;

  /**
   * Use a callback to track account changes
   * @param callback
   * @param commitment
   */
  onChange(callback: (info: T) => void, commitment?: Commitment): Unsubscriber;
}

export type IPDAAccountLoader = {
  bump(): Promise<number>;
};

export type ITokenAccountLoader = {
  balance(commitment?: Commitment): Promise<bigint>;
  mint(): Promise<MintLoader>;
};

export type Parser<T> = (info: AccountInfo<Buffer>) => T;
