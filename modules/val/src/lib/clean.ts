import { withInit } from "./withInit";
import { interruptAndResume } from "./utils";
import { run } from "./run";
import { VAL_FOLDER } from "../constants";

export const clean = withInit(
  interruptAndResume(
    async () => {
      await run(`rm -rf ${VAL_FOLDER}`);
      return false;
    },
    { dontResume: true }
  )
);
