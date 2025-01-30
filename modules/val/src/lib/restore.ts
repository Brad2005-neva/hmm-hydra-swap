// pause the currently running validator if one is running
// save it's state

import fs from "fs";
import { withInit } from "./withInit";
import { interruptAndResume } from "./utils";
import { run } from "./run";
import { findAliasFilename } from "./alias";
import { VAL_FOLDER, CUR_FOLDER, SNAPS_FOLDER } from "../constants";
// restart the validator returning the hash
export const restore = withInit(
  interruptAndResume(
    async (background: boolean, hashOrAlias: string) => {
      if (!hashOrAlias) throw new Error("hash not provided");
      console.log("Restoring from state: " + hashOrAlias);
      const archive = `${VAL_FOLDER}/${hashOrAlias}`;

      const alias = `${SNAPS_FOLDER}/${findAliasFilename(hashOrAlias)}`;
      const archiveOrAlias = fs.existsSync(archive) ? archive : alias;

      if (fs.existsSync(archiveOrAlias)) {
        await run(`rm -rf ${CUR_FOLDER}`);
        await run(`mkdir -p ${CUR_FOLDER}`);
        await run(`tar -xzf ${archiveOrAlias} -C ${CUR_FOLDER}`);
      } else {
        throw new Error("Could not restore from " + hashOrAlias);
      }
      return background;
    },
    { forceResume: true }
  )
);
