import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { DefaultArgs } from "../../sdk/types";
import {
  SetPricesOwnerArgs,
  setPricesOwner,
  setPricesOwnerMultisig,
} from "../../sdk";

export const command = "set-prices-owner";

export const description = "Set Prices Owner";

export const builder: CommandBuilder<DefaultArgs, SetPricesOwnerArgs> = (
  yargs
) =>
  yargs.options({
    owner: {
      type: "string",
      demandOption: true,
      describe: "The new owner of all price feed accounts",
    },
  });

export const handler = async (a: SetPricesOwnerArgs) => {
  const method = a.multisigSafe ? setPricesOwnerMultisig : setPricesOwner;

  render(await method(a));
};
