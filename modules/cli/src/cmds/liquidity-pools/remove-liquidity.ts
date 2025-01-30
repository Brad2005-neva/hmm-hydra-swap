import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { removeLiquidity, removeLiquidityMultisig } from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "remove-liquidity";

export const description = "Remove Liquidity";
export type RemoveLiquidityArgs = DefaultArgs & {
  tokenXMint: string;
  tokenYMint: string;
  poolId: number;
  lpTokensToBurn: number;
};

export const builder: CommandBuilder<DefaultArgs, RemoveLiquidityArgs> = (
  yargs
) =>
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
    lpTokensToBurn: {
      type: "number",
      demandOption: true,
      describe:
        "The number of lpTokens you wish to send to the contract in non divisable units.",
    },
  });

export const handler = async (a: RemoveLiquidityArgs) => {
  const method = a.multisigSafe ? removeLiquidityMultisig : removeLiquidity;

  render(await method(a));
};
