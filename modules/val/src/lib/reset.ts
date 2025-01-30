import { withInit } from "./withInit";
import { interruptAndResume } from "./utils";
import { run } from "./run";
import { CUR_FOLDER } from "../constants";

export const reset = withInit(
  interruptAndResume(async () => {
    await run(`rm -rf ${CUR_FOLDER}`);
    return true;
  })
);
