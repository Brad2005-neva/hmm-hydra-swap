import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { inspect } from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "inspect";

export const description = "Inspect account";

export type InspectArgs = DefaultArgs & {
  poolId?: number;
  data?: boolean;
};

export const builder: CommandBuilder<DefaultArgs, InspectArgs> = (yargs) =>
  yargs.options({
    poolId: { type: "number" },
    data: { type: "boolean" },
  });

export const handler = async (a: InspectArgs) => {
  const account = await inspect(a);

  render(account, ["Key", "Value"]);
};
