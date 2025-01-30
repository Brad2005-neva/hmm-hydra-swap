import { save } from "../lib/save";
import { getConfig } from "../cli";

export default async function () {
  const config = getConfig();
  const [alias] = config.subCommands;
  await save(config.background, alias);
}
