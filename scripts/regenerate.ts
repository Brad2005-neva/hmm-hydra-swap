import { Asset, Network } from "@hydraprotocol/sdk";

import { Keypair } from "@solana/web3.js";
import {
  getAssets,
  getTokenStore,
  NetworkedTokenMap,
} from "@hydraprotocol/sdk";
import { loadKey, saveKey } from "@hydraprotocol/sdk/node";
import { exec } from "child_process";
import expandTilde from "expand-tilde";
import fs from "fs";
import arg from "arg";
import { main } from "@hydraprotocol/utils-node";
import { pathFromRoot } from "@hydraprotocol/utils-node";

type UsersKey = {
  treasury: string;
  trader: string;
};
type ProgramIds = {
  hydraBenchmarks: string;
  hydraLiquidityPools: string;
};
type NetworkConfig = { programIds: ProgramIds; users: UsersKey };
type GlobalConfig = {
  [k in Network]: NetworkConfig;
};

const safeAccounts = [
  // List of accounts to keep during regeneration
  "god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D",
];

const args = arg({
  "--network": String,
  "--programs": Boolean,
  "--overwrite": Boolean,
});

function writeTokens(network: Network, newTokens: Asset[]) {
  const tokenStore = getTokenStore();
  const newTokenStore = {
    ...tokenStore,
    [network]: newTokens,
  };
  fs.writeFileSync(
    pathFromRoot("modules/config/tokens.json"),
    JSON.stringify(newTokenStore, null, 2) + "\n"
  );
}

function updateUser(
  config: GlobalConfig,
  network: Network,
  userKey: "trader" | "treasury",
  value: string
) {
  return {
    ...config,
    [network]: {
      ...config[network],
      users: {
        ...config[network].users,
        [userKey]: value,
      },
    },
  };
}

async function updateJson<T>(file: string, updater: (json: T) => T) {
  const json = JSON.parse(fs.readFileSync(file).toString()) as T;
  fs.writeFileSync(file, JSON.stringify(updater(json), null, 2) + "\n");
}

async function writeTrader(network: Network, keypair: Keypair) {
  updateJson<GlobalConfig>(
    pathFromRoot("modules/config/global-config.json"),
    (config) =>
      updateUser(config, network, "trader", keypair.publicKey.toString())
  );
}

async function writeTreasury(network: Network, keypair: Keypair) {
  updateJson<GlobalConfig>(
    pathFromRoot("modules/config/global-config.json"),
    (config) =>
      updateUser(config, network, "treasury", keypair.publicKey.toString())
  );
}

async function regenerate(network: Network) {
  // Regenerate the keys within the list targeting specific clusters writing their keys to the repo
  // pull list of tokens from config/tokens.json[network]
  const curTokens = getAssets(network);

  const newTokens: Asset[] = [];

  for (const token of curTokens) {
    // for each token generate a new keypair
    const keypair = Keypair.generate();

    const newToken = {
      ...token,
      address: keypair.publicKey.toString(),
    };

    newTokens.push(newToken);

    // write each keypairs private key to /keys/tokens/xxx.json don't delete the old ones they might be used elsewhere
    await saveKey(keypair);
  }

  // update the list of tokens with the new publickeys config/tokens.json[network]
  writeTokens(network, newTokens);

  // regenerate trader key
  const demoAccountKeys = Keypair.generate();

  await writeTrader(network, demoAccountKeys);
  await saveKey(demoAccountKeys, "users");
  await tidyUpTokens();
}

async function tidyUpTokens() {
  const map = JSON.parse(
    fs.readFileSync(pathFromRoot("modules/config/tokens.json")).toString()
  ) as NetworkedTokenMap;

  const globalConfig = JSON.parse(
    fs
      .readFileSync(pathFromRoot("modules/config/global-config.json"))
      .toString()
  ) as GlobalConfig;

  const allowedTokenAddresses: string[] = [];
  for (const net of Object.values(Network)) {
    const tokens = map[net] ?? [];
    for (const token of tokens) {
      allowedTokenAddresses.push(token.address);
    }
  }

  const keysToRemove = fs
    .readdirSync(pathFromRoot("keys/tokens"))
    .map((tokenJson) => tokenJson.replace(/\.json$/, ""))
    .filter((key) => !allowedTokenAddresses.includes(key));

  for (const key of keysToRemove) {
    fs.unlinkSync(pathFromRoot(`keys/tokens/${key}.json`));
  }

  // Load
  const devnetaccount = globalConfig.devnet.users.trader;
  const localaccount = globalConfig.localnet.users.trader;

  const keepAccounts = safeAccounts.concat(devnetaccount, localaccount);

  const usersToRemove = fs
    .readdirSync(pathFromRoot("keys/users"))
    .map((tokenJson) => tokenJson.replace(/\.json$/, ""))
    .filter((key) => !keepAccounts.includes(key));

  for (const key of usersToRemove) {
    fs.unlinkSync(pathFromRoot(`keys/users/${key}.json`));
  }
}

function isNetwork(value: any): value is Network {
  return Object.values(Network).includes(value);
}

main(async () => {
  const network = args["--network"] as Network;
  const doRegeneratePrograms = !!args["--programs"];
  const overwriteTreasury = !!args["--overwrite"];

  if (doRegeneratePrograms) {
    await new Promise((resolve) => {
      exec("./regenerate-program-ids.sh", (err, stout, sterr) => {
        resolve(err ? stout : sterr);
      });
    });
  }

  if (overwriteTreasury) {
    await writeTreasury(
      network,
      await loadKey(expandTilde("~/.config/solana/id.json"))
    );
  }

  if (!isNetwork(network)) {
    console.log(
      `--network must be one of the following: ${Object.values(Network)}`
    );
    process.exit(1);
  }
  await regenerate(network);
});
