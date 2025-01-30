import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { inspect, LsAccountArgs } from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "lsa";

export const description = "List accounts";

export const builder: CommandBuilder<DefaultArgs, LsAccountArgs> = (yargs) =>
  yargs.options({
    tokenXMint: { type: "string" },
    tokenYMint: { type: "string" },
    poolId: { type: "number" },
  });

export const handler = async (a: LsAccountArgs) => {
  const account = await inspect(a);

  render(account, ["Key", "Value"]);
};
