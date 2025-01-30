import { withInit } from "./withInit";
import { interruptAndResume } from "./utils";
import { hashElement } from "folder-hash";
// import $ from "./zx";
// import { quiet } from "zx";
import { VAL_FOLDER, CUR_FOLDER } from "../constants";
import { alias } from "./alias";
import { run } from "./run";

async function getFolderHash(path: string) {
  return `${(await hashElement(path, { encoding: "hex" })).hash}`.slice(0, 8);
}

export const save = withInit(
  interruptAndResume(
    async (background: boolean = false, aliasName?: string) => {
      // get the hash value of the current folder
      const hash = await getFolderHash(CUR_FOLDER);
      const hashFolder = `${VAL_FOLDER}/${hash}`;

      // saves the current validator's state to a hash checksum
      await run(`tar -czf ${hashFolder} -C ${CUR_FOLDER} .`);

      if (aliasName) {
        await alias(hash, aliasName);
      }

      return background;
    }
  )
);
