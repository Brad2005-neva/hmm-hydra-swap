import arg from "arg";
import start from "./commands/start";
import save from "./commands/save";
import stop from "./commands/stop";
import reset from "./commands/reset";
import clean from "./commands/clean";
import alias from "./commands/alias";
import usage from "./commands/usage";
import list from "./commands/list";
import status from "./commands/status";
import { loadConfig } from "./lib/config";

export type Config = ReturnType<typeof getConfig>;

export function getConfig() {
  const { accounts = [], bpfPrograms = [] } = loadConfig();
  const args = arg({
    "--background": Boolean,
    "--url": String,
    "--speed": String,
    "--start-slot": Number,
    "-c": [String],
    "-d": Boolean,
    "--help": Boolean,
    "-h": Boolean,
    "--quiet": Boolean,
    "-q": Boolean,
    "--log": Boolean,
  });
  const background = Boolean(args["--background"] || args["-d"]);
  const showHelp = Boolean(args["--help"] || args["-h"]);
  const quiet = Boolean(args["--quiet"] || args["-q"]);
  const ticksPerSlot = { slow: 400, medium: 100, fast: 10 }[
    args["--speed"] ?? ("fast" as "slow" | "medium" | "fast")
  ];
  const startSlot = args["--start-slot"] ?? 0;
  const cloneAccounts = args["-c"];
  const cloneUrl = args["--url"];
  const log = Boolean(args["--log"]);
  const [command, ...subCommands] = args._;

  if (
    (cloneAccounts && cloneAccounts.length > 0 && !cloneUrl) ||
    (cloneUrl && !cloneAccounts)
  ) {
    throw new Error(
      "You must supply a url as well as one of more clone accounts."
    );
  }

  return {
    command,
    background,
    showHelp,
    subCommands,
    quiet,
    cloneAccounts,
    cloneUrl,
    accounts,
    bpfPrograms,
    ticksPerSlot,
    startSlot,
    log,
  };
}

async function entrypoint() {
  const config = getConfig();

  if (config.showHelp) {
    return await usage();
  }

  switch (config.command) {
    case "save":
      return await save();
    case "stop":
      return await stop();
    case "reset":
      return await reset();
    case "clean":
      return await clean();
    case "list":
      return await list();
    case "alias":
      return await alias();
    case "status":
      return await status();
    default:
      return await start();
  }
}

function parseError(err: any) {
  return err.message;
}

export default async function main() {
  try {
    await entrypoint();
  } catch (err) {
    console.log(parseError(err));
    process.exit(1);
  }
}
