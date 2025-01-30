// import $ from "./zx";
import fs from "fs";
// import { quiet } from "zx";
import { run } from "./run";
import { SNAPS_FOLDER, VAL_FOLDER } from "../constants";

export function findAliasFilename(name: string) {
  const files = fs.readdirSync(SNAPS_FOLDER);
  return files.filter((fname) => {
    const [aliasPart] = fname.split(":");
    return name === aliasPart;
  })[0];
}

export async function alias(hash: string, name: string) {
  const hashFile = `${VAL_FOLDER}/${hash}`;
  const target = `${SNAPS_FOLDER}/${name}`;

  if (!fs.existsSync(hashFile)) {
    throw new Error("Hash does not exist or has not been saved. ");
  }
  await run(`mkdir -p ${SNAPS_FOLDER}`);
  await run(`mv ${hashFile} ${target}`);
  console.log(`Saved alias "${name}"`);
}

export async function deleteAlias(name: string) {
  const target = `${SNAPS_FOLDER}/${name}`;

  await run(`rm -rf ${target}`);
}
