import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { DefaultArgs } from "../../sdk/types";
import {
  TransferPoolAdminArgs,
  transferPoolAdmin,
  transferPoolAdminMultisig,
} from "../../sdk";

export const command = "transfer-pool-admin";

export const description = "Transfer pool admin ownership";

export const builder: CommandBuilder<DefaultArgs, TransferPoolAdminArgs> = (
  yargs
) =>
  yargs.options({
    admin: {
      type: "string",
      demandOption: true,
      describe: "The new admin",
    },
    poolId: {
      type: "number",
      demandOption: true,
      describe: "Pool Id index",
    },
  });

export const handler = async (a: TransferPoolAdminArgs) => {
  const method = a.multisigSafe ? transferPoolAdminMultisig : transferPoolAdmin;

  render(await method(a));
};
