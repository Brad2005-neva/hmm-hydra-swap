import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { initFaucet, InitFaucetArgs } from "../../sdk/initFaucet";
import { DefaultArgs } from "../../sdk/types";

export const command = "init";

export const description = "Initialize a faucet token";

export const builder: CommandBuilder<DefaultArgs, InitFaucetArgs> = (yargs) =>
  yargs.options({
    tokenDecimal: {
      type: "number",
      default: 9,
    },
    quiet: {
      alias: "q",
      type: "boolean",
      default: false,
    },
  });

export const handler = async (a: InitFaucetArgs) => {
  const { tx, key } = await initFaucet(a);
  if (a.quiet) {
    render(key);
  }

  render([tx, key]);
};
