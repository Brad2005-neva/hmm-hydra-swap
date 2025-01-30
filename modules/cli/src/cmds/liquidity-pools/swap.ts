import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { DefaultArgs } from "../../sdk/types";
import { SwapArgs, swap, swapMultisig } from "../../sdk";

export const command = "swap";

export const description = "Swap tokens";

export const builder: CommandBuilder<DefaultArgs, SwapArgs> = (yargs) =>
  yargs.options({
    tokenXMint: {
      type: "string",
      demandOption: true,
      describe: "Token X Mint address",
    },
    tokenYMint: {
      type: "string",
      demandOption: true,
      describe: "Token Y Mint address",
    },
    poolId: {
      type: "number",
      demandOption: true,
      describe: "The pool index id",
    },
    userFromToken: {
      type: "string",
      demandOption: true,
      describe: "ATA holding the tokens to send",
    },
    userToToken: {
      type: "string",
      demandOption: true,
      describe: "ATA to recieve the converted token",
    },
    amountIn: {
      type: "number",
      demandOption: true,
      describe:
        "The amount of the sending token you wish to swap in non-divisable units.",
    },
    minimumAmountOut: {
      type: "number",
      demandOption: true,
      describe:
        "The minimum amount you expect to receive including slippage in non-divisable units.",
    },
  });

export const handler = async (a: SwapArgs) => {
  const method = a.multisigSafe ? swapMultisig : swap;

  render(await method(a));
};
