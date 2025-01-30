import { PublicKey } from "@solana/web3.js";
import { Mint, Token } from ".";
import {
  IAccountLoader,
  Getter,
  PDAKey,
  IPDAAccountLoader,
  ITokenAccountLoader,
} from "./types";

export function withBump<T extends IAccountLoader<any>>(
  getter: Getter<PDAKey>,
  getLoader: (getter: Getter<PublicKey>) => T
): T & IPDAAccountLoader {
  const keyGetter = async () => {
    const [key] = await getter();
    return key;
  };
  const loader = getLoader(keyGetter);
  return {
    ...loader,
    async bump() {
      const [, bump] = await getter();
      return bump;
    },
  };
}

export function withoutBump<T extends IAccountLoader<any>>(
  key: PublicKey,
  getLoader: (key: PublicKey) => T
): T {
  const loader = getLoader(key);
  return {
    ...loader,
  };
}

export function withTokenMethods<T extends IAccountLoader<any>>(
  loader: T
): T & ITokenAccountLoader {
  return {
    ...loader,

    async balance(commitment) {
      const bal = await loader
        .ctx()
        .connection.getTokenAccountBalance(await loader.key(), commitment);

      return BigInt(bal.value.amount);
    },

    async mint() {
      const key = await loader.key();
      const token = Token(loader.ctx(), key);
      const info = await token.info();
      return Mint(loader.ctx(), info.data.mint);
    },
  };
}
