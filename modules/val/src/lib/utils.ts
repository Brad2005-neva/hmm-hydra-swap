import { stop } from "./stop";
import { start } from "./start";
import { SOLANA_EXEC, VAL_FOLDER } from "../constants";
import { run } from "./run";

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function isRunning() {
  try {
    await run(`pidof ${SOLANA_EXEC}`, { quiet: true });
    return true;
  } catch (err) {
    return false;
  }
}

export function interruptAndResume<T extends unknown[]>(
  fn: (...args: T) => Promise<boolean>,
  options?: { dontResume?: boolean; forceResume?: boolean }
) {
  return async (...args: T) => {
    // pause the currently running validator if running

    const wasRunning = await isRunning();
    if (wasRunning) {
      await stop();
      // Extra sleep to ensure we don't have any folder access
      await sleep(2000);
    }

    // kill the dangling socket file
    const socketFile = `${VAL_FOLDER}/current/admin.rpc`;
    await run(`rm -rf ${socketFile}`);

    // Run payload
    const background = await fn(...args);

    // If the validator was running restart the validator
    if (options?.dontResume) {
      return;
    }

    if (options?.forceResume || wasRunning) {
      await start(background);
    }
  };
}
