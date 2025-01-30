import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import {
  initializeGlobalState,
  InitializeGlobalStateArgs,
  initializeGlobalStateMultisig,
} from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "initialize-global-state";

export const description = "Initialize Global State";

export const builder: CommandBuilder<DefaultArgs, InitializeGlobalStateArgs> = (
  yargs
) => yargs;

export const handler = async (a: InitializeGlobalStateArgs) => {
  const method = a.multisigSafe
    ? initializeGlobalStateMultisig
    : initializeGlobalState;

  render(await method(a));
};
