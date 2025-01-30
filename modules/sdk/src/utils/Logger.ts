import { PublicKey } from "@solana/web3.js";
import { Network } from "..";

function isPublicKey(item: any): item is PublicKey {
  return !!item["toBase58"];
}

// Can probably be its own shared module for everything
export class Logger {
  constructor(private network: Network = Network.LOCALNET) {}

  isDebugOff = () => {
    return (
      (!globalThis.DEBUG && !process.env.DEBUG) ||
      this.network === Network.MAINNET_BETA
    );
  };

  log = (...strOrObjArr: Array<Record<string, any> | string | PublicKey>) => {
    if (this.isDebugOff()) return;

    const loggable = strOrObjArr.map((item) => {
      if (typeof item === "string") return item;
      if (isPublicKey(item)) return item.toString();
      return Object.entries(item)
        .map(([k, v]) => ` ${k}: ${tryString(v)}`)
        .join("\n");
    });

    console.log(...loggable);
  };

  static new = (network?: Network) => {
    return new Logger(network);
  };
}

function tryString(item: any) {
  if (typeof item === "undefined") return "undefined";
  if (["string", "number", "bigint", "boolean"].includes(typeof item))
    return item;
  try {
    const stringed = item.toString();
    if (stringed !== "[object Object]") return stringed;
  } catch (err) {
    console.error(err);
  }

  return JSON.stringify(item, (_, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
  );
}
