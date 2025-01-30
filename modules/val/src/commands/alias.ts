import { alias, deleteAlias } from "../lib/alias";
import { getConfig } from "../cli";
export default async function () {
  const config = getConfig();

  const [hashOrCommand, name] = config.subCommands;
  if (hashOrCommand === "delete") {
    return await deleteAlias(name);
  }

  if (!name || !hashOrCommand || hashOrCommand.length !== 8) {
    throw new Error(
      "Invalid arguments. Please include both a hash and a name."
    );
  }

  await alias(hashOrCommand, name);
}
