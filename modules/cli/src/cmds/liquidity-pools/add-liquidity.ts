import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { DefaultArgs } from "../../sdk/types";
import {
  AddLiquidityArgs,
  addLiquidity,
  addLiquidityMultisig,
} from "../../sdk";

export const command = "add-liquidity";

export const description = "Add Liquidity";

export const builder: CommandBuilder<DefaultArgs, AddLiquidityArgs> = (yargs) =>
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
    tokenXAmount: {
      type: "number",
      demandOption: true,
      describe:
        "The amount of token X you wish to add to the pool in non-divisable units",
    },
    tokenYAmount: {
      type: "number",
      demandOption: true,
      describe:
        "The amount of token Y you wish to add to the pool in non-divisable units",
    },
    slippage: { type: "number" },
  });

export const handler = async (a: AddLiquidityArgs) => {
  const method = a.multisigSafe ? addLiquidityMultisig : addLiquidity;
  render(await method(a));
};
