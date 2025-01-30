import bs58 from "bs58";
import arg from "arg";
import fs from "fs";

import { main } from "@hydraprotocol/utils-node";
import { resolve } from "path";

const args = arg({});

// Get private key from keypair

main(async () => {
  const [filepath] = args._;
  if (!filepath) {
    throw new Error("filepath not provided");
  }

  const resolvedPath = resolve(__dirname, "../", filepath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error("could not find file");
  }

  const sk = JSON.parse(fs.readFileSync(resolvedPath).toString());

  console.log(bs58.encode(sk));
});
