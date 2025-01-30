import { Network } from "@hydraprotocol/sdk";
import { main } from "@hydraprotocol/utils-node";
import fs from "fs";
import { resolve } from "path";
import tokensType from "@hydraprotocol/config/tokens.json";

function isNetwork(network?: string): network is Network {
  if (!network) return false;
  return Object.values(Network).includes(network as Network);
}

function requireNetwork(network?: string): Network {
  if (isNetwork(network)) return network;
  throw new Error(
    `--network must be one of the following: ${Object.values(Network)}`
  );
}

function ensureValue<T>(
  value: T | undefined | null,
  msg = "Value cannot be null or undefined"
): T {
  if (typeof value === "undefined" || value == null) {
    throw new Error(msg);
  }
  return value;
}

function ensureObjKey<T extends object>(
  obj: T,
  key: any,
  msg = "Key is not keyof object"
): keyof T {
  if (!Object.keys(obj).includes(key)) {
    throw new Error(msg);
  }
  return key as keyof T;
}
const root = resolve(__dirname, "../");
main(
  {
    "--network": String,
    "--token": String,
    "--address": String,
  },
  async (args) => {
    const network = requireNetwork(args["--network"]);
    const token = ensureValue(args["--token"], "--token must not be null");
    const address = ensureValue(
      args["--address"],
      "--address must not be null"
    );
    const tokensConfigPath = resolve(root, "modules/config/tokens.json");
    // dont use tokensType above because it could be out of date but we use it for typing
    const tokens = JSON.parse(
      fs.readFileSync(tokensConfigPath).toString()
    ) as typeof tokensType;

    const tokenKey = ensureObjKey(
      tokens,
      network,
      "network must be key of token.json"
    );

    tokens[tokenKey] = tokens[tokenKey].map((item) => {
      if (item.symbol.toLowerCase() === token.toLowerCase()) {
        return {
          ...item,
          address,
        };
      }
      return item;
    });

    fs.writeFileSync(tokensConfigPath, JSON.stringify(tokens, null, 2));
  }
);
