// import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";

export function findFileUp(currentPath: string, search: string): string | null {
  const files = fs.readdirSync(currentPath);
  if (files.includes(search)) {
    return path.resolve(currentPath, search);
  }

  if (currentPath === "/") {
    return null;
  }

  return findFileUp(path.dirname(currentPath), search);
}

export type CliAccountDescription = { address: string; location: string };
type ConfJson = {
  cwd: string;
  accounts?: CliAccountDescription[];
  "bpf-programs"?: CliAccountDescription[];
};

type Conf = {
  cwd: string;
  accounts?: CliAccountDescription[];
  bpfPrograms?: CliAccountDescription[];
};

function isSolanaAddress(address: string) {
  try {
    const key = new PublicKey(address);
    return PublicKey.isOnCurve(key.toBuffer());
  } catch (err) {
    return false;
  }
}

export function loadConfig(): Conf {
  const configLocation = findFileUp(process.cwd(), "val.json");

  if (configLocation === null) {
    return { cwd: process.cwd() };
  }

  const buff = fs.readFileSync(configLocation);

  const {
    cwd,
    accounts = [],
    "bpf-programs": bpfPrograms = [],
  } = JSON.parse(buff.toString()) as ConfJson;

  const configFolder = path.dirname(configLocation);

  const config = {
    cwd: path.resolve(configFolder, cwd),
    accounts: accounts.map(({ address, location }) => ({
      address,
      location: path.resolve(configFolder, location),
    })),
    bpfPrograms: bpfPrograms.map(({ address, location }) => ({
      address: !isSolanaAddress(address)
        ? path.resolve(configFolder, address) // can be paths to keystore files
        : address,
      location: path.resolve(configFolder, location),
    })),
  };

  return config;
}

let _conf: null | string = null;
export function getCwd(): string {
  if (!_conf) {
    _conf = loadConfig().cwd;
  }
  return _conf;
}
