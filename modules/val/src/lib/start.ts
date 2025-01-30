import { stop } from "./stop";
import { withInit } from "./withInit";
import { run } from "./run";
import { SOLANA_EXEC, CUR_FOLDER } from "../constants";

import waitOn from "wait-on";
import { CliAccountDescription } from "./config";
import os from "node:os";

async function solanaTestValidator(
  background = false,
  quiet = false,
  clone: string[] = [],
  cloneUrl = "",
  accounts: CliAccountDescription[] = [],
  bpfPrograms: CliAccountDescription[] = [],
  ticksPerSlot = 5,
  startSlot = 0,
  log = false
) {
  console.log("Starting solana test validator...");

  const cloneCliArgs =
    clone.length > 0 && cloneUrl
      ? ["-c", ...clone, `--url ${cloneUrl}`].join(" ")
      : "";

  const accountCliArgs = accounts
    .map((acc) => `--account ${acc.address} ${acc.location}`)
    .join(" ")
    .trim();

  const bpfProgramCliArgs = bpfPrograms
    .map((acc) => `--bpf-program ${acc.address} ${acc.location}`)
    .join(" ")
    .trim();

  const reset =
    cloneCliArgs.length + accountCliArgs.length + bpfProgramCliArgs.length > 0
      ? `--reset --ticks-per-slot ${ticksPerSlot} ${
          startSlot ? `--warp-slot ${startSlot}` : ""
        }`
      : "";

  const instruction =
    `${SOLANA_EXEC} --ledger ${CUR_FOLDER} ${cloneCliArgs} ${accountCliArgs} ${bpfProgramCliArgs} ${reset}`.trim();

  try {
    if (!background && !log) {
      return await run(instruction, { quiet });
    }
    // validator binds to any address on macOS instead of loopback
    const platform = os.platform();
    const resources =
      platform == "darwin" ? "tcp:0.0.0.0:8899" : "tcp:localhost:8899";

    // wait for tcp port on validator to become available
    const readyProm = waitOn({
      resources: [resources],
    });
    // Run in detached mode
    run(instruction, {
      quiet: true,
      detached: true,
    });
    await readyProm;
    if (log)
      await run(`solana logs --url ${resources.replace(/^tcp:/, "http://")}`);

    console.log("Process started.");
  } catch (err) {
    console.log(err);
  }
}

export const start = withInit(
  async (
    background: boolean = false,
    shh: boolean = false,
    clone: string[] = [],
    cloneUrl: string = "",
    accounts: CliAccountDescription[] = [],
    bpfPrograms: CliAccountDescription[] = [],
    ticksPerSlot: number = 10,
    startSlot: number = 0,
    log: boolean = false
  ) => {
    // Run stop
    await stop();
    // start a validator
    await solanaTestValidator(
      background,
      shh,
      clone,
      cloneUrl,
      accounts,
      bpfPrograms,
      ticksPerSlot,
      startSlot,
      log
    );
  }
);
