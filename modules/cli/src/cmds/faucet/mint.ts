import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { MintTokenArgs, mintTokens } from "../../sdk/mintTokens";
import { DefaultArgs } from "../../sdk/types";

export const command = "mint";

export const description = "Mint tokens";

export const builder: CommandBuilder<DefaultArgs, MintTokenArgs> = (yargs) =>
  yargs.options({
    tokenMint: { type: "string", demandOption: true },
    recipient: { type: "string", demandOption: true },
    amount: { type: "number", demandOption: true },
  });

export const handler = async (a: MintTokenArgs) => {
  const { tx } = await mintTokens(a);
  render(tx);
};
