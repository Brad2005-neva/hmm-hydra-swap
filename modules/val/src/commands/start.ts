import { start } from "../lib/start";
import { restore } from "../lib/restore";
import { getConfig } from "../cli";

export default async function () {
  const config = getConfig();

  // val foo -> start() with hash being foo
  const alias = config.command;

  if (alias) {
    await restore(config.background, alias);
  } else {
    await start(
      config.background,
      config.quiet,
      config.cloneAccounts,
      config.cloneUrl,
      config.accounts,
      config.bpfPrograms,
      config.ticksPerSlot,
      config.startSlot,
      config.log
    );
  }
}
