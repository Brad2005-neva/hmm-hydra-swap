import { resolve } from "path";
import * as anchor from "@project-serum/anchor";
import arg from "arg";
import NetworkMap from "@hydraprotocol/config/network-map.json";
import { main } from "@hydraprotocol/utils-node";
import { getDeployerWallet, createProvider } from "@hydraprotocol/utils-solana";
import toml from "toml";
import expandTilde from "expand-tilde";
import fs from "fs";

type MigrationFn = (p: anchor.AnchorProvider) => Promise<void>;

const args = arg({
  "--network": String,
  "--scripts": String,
});

// messy script to run our deploy scripts in
// light of anchor migrate not working
// we can customise this for other environments to point to other files.
main(async () => {
  const feature = args["--network"] || "localnet";
  const migrationScripts = args["--scripts"];

  if (!Object.keys(NetworkMap).includes(feature)) {
    console.log("Invalid network: " + feature);
    process.exit(1);
  }

  // Get the url from the feature
  const url = NetworkMap[feature as keyof typeof NetworkMap];
  console.log("url: ", url);

  const config = toml.parse(
    fs
      .readFileSync(resolve(__dirname, "../modules/core/Anchor.toml"))
      .toString()
  );
  process.env.ANCHOR_WALLET = expandTilde(config.provider.wallet);

  // load user script
  const script = resolve(
    __dirname,
    `../modules/migrations/${migrationScripts || feature}.ts`
  );

  console.log("Loading script:" + script);
  const userScript = (await import(script)).default as MigrationFn;
  console.log("Loaded!");

  const preflightCommitment: anchor.web3.Commitment = "recent";
  const connection = new anchor.web3.Connection(url, preflightCommitment);

  const wallet = getDeployerWallet();

  const provider = createProvider(connection, wallet, preflightCommitment);

  // Run userScript with provider
  await userScript(provider);
  console.log("Finished running script");
});
