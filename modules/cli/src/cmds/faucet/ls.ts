import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { LsFaucetArgs, lsFaucet } from "../../sdk/lsFaucet";
import { DefaultArgs } from "../../sdk/types";

export const command = "ls";

export const description = "List faucet tokens";

export const builder: CommandBuilder<DefaultArgs, LsFaucetArgs> = (yargs) =>
  yargs;

export const handler = async (a: LsFaucetArgs) => {
  const out = await lsFaucet(a);

  render(out, ["Key", "Value"]);
};
