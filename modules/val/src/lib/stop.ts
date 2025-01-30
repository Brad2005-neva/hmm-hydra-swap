import { sleep } from "./utils";
import { withInit } from "./withInit";
import { run } from "./run";
import { SOLANA_PROCESS_SEARCH } from "../constants";
export const stop = withInit(async () => {
  try {
    // Wait for any dangling processes
    await sleep(500);
    // kill all validator processes
    await run(`pkill -9 ${SOLANA_PROCESS_SEARCH}`);
    console.log("Stopped validator");
    await sleep(500);
  } catch (_err) {
    // process likely does not exist so swallow error
  }
});
