import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { DefaultArgs } from "../../sdk/types";
import {
  TransferGlobalAdminArgs,
  transferGlobalAdmin,
  transferGlobalAdminMultisig,
} from "../../sdk";

export const command = "transfer-global-admin";

export const description = "Transfer global admin ownership";

export const builder: CommandBuilder<DefaultArgs, TransferGlobalAdminArgs> = (
  yargs
) =>
  yargs.options({
    admin: {
      type: "string",
      demandOption: true,
      describe: "The new admin",
    },
  });

export const handler = async (a: TransferGlobalAdminArgs) => {
  const method = a.multisigSafe
    ? transferGlobalAdminMultisig
    : transferGlobalAdmin;

  render(await method(a));
};
