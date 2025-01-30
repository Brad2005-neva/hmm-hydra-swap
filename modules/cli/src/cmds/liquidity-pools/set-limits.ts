import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { SetLimitsArgs, setLimits, setLimitsMultisig } from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "set-limits";

export const description = "Set Limits";

export const builder: CommandBuilder<DefaultArgs, SetLimitsArgs> = (yargs) =>
  yargs.options({
    poolId: {
      type: "number",
      demandOption: true,
      describe: "The pool index id",
    },
    enabled: {
      type: "boolean",
      demandOption: true,
      describe: "Flag to enable or disable limits.",
    },
    liquidityTokenXMax: {
      type: "number",
      demandOption: true,
      describe:
        "Maximum amount of token X that can be added or removed from a liquidity pool.",
    },
    liquidityTokenYMax: {
      type: "number",
      demandOption: true,
      describe:
        "Maximum amount of token Y that can be added or removed from a liquidity pool.",
    },
    swapTokenXMax: {
      type: "number",
      demandOption: true,
      describe:
        "Maximum amount of token X that can be swapped in a liquidity pool.",
    },
    swapTokenYMax: {
      type: "number",
      demandOption: true,
      describe:
        "Maximum amount of token Y that can be swapped in a liquidity pool",
    },
  });

export const handler = async (a: SetLimitsArgs) => {
  const method = a.multisigSafe ? setLimitsMultisig : setLimits;

  render(await method(a));
};
