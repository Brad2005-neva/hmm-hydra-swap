import { Commitment, PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Parser, IAccountLoader } from "./types";
import { KeyOrGetter } from "./index";
import { InternalAccountLoader } from "./internal-account-loader";
import { cache } from "./cache";

const loaderStore = new Map<string, IAccountLoader<any>>();

// AccountLoader
// Wrapper to handle all the issues arrising from requiring async keys
export class AccountLoader<T> implements IAccountLoader<T> {
  private _key?: PublicKey;
  private _accountLoader?: IAccountLoader<T>;

  constructor(
    private readonly _ctx: Ctx,
    private readonly getter: KeyOrGetter,
    private readonly accountParser: Parser<T>
  ) {}

  public key = async () => {
    if (typeof this._key !== "undefined") {
      return this._key;
    }

    if (typeof this.getter === "function") {
      this._key = await this.getter();
    } else {
      this._key = this.getter;
    }

    return this._key;
  };

  public ready = async () => {
    await this.getAccountLoader();
  };

  public stream = (commitment?: Commitment) => {
    return from(this.getAccountLoader()).pipe(
      switchMap((loader) => loader.stream(commitment))
    );
  };

  public ctx = () => {
    return this._ctx;
  };

  public info = async (commitment?: Commitment) => {
    return (await this.getAccountLoader()).info(commitment);
  };

  public isInitialized = async () => {
    return (await this.getAccountLoader()).isInitialized();
  };

  public parser = () => {
    return this.accountParser;
  };

  public onChange = (callback: (info: T) => void, commitment?: Commitment) => {
    return this.stream(commitment).subscribe(
      (info) => info && callback(info.account.data)
    ).unsubscribe;
  };

  private getAccountLoader = async () => {
    // Cache account loader
    if (typeof this._accountLoader !== "undefined") {
      return this._accountLoader;
    }

    const __key = await this.key();
    this._accountLoader = cache(loaderStore, `${__key}:loader`, () =>
      InternalAccountLoader(this._ctx, __key, this.accountParser)
    );
    if (!this._accountLoader)
      throw new Error("Account loader missing from cache");
    return this._accountLoader;
  };

  static create = <T>(
    _ctx: Ctx,
    getter: KeyOrGetter,
    accountParser: Parser<T>
  ): IAccountLoader<T> => {
    return new AccountLoader<T>(_ctx, getter, accountParser);
  };
}
