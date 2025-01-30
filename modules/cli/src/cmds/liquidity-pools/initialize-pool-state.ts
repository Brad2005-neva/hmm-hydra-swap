import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import {
  initializePoolState,
  InitializePoolStateArgs,
  initializePoolStateMultisig,
} from "../../sdk";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";
import { DefaultArgs } from "../../sdk/types";
export const command = "initialize-pool-state";

export const description = "Initialize Pool";

export const builder: CommandBuilder<DefaultArgs, InitializePoolStateArgs> = (
  yargs
) =>
  yargs.options({
    feeCalculation: { type: "string", default: feeDefaults.feeCalculation },
    feeLastUpdate: {
      type: "number",
      default: Number(feeDefaults.feeLastUpdate),
    },
    feeLastPrice: { type: "number", default: feeDefaults.feeLastPrice },
    feeEwmaWindow: {
      type: "number",
      default: feeDefaults.feeEwmaWindow,
    },
    feeLastEwma: { type: "number", default: feeDefaults.feeLastEwma },
    feeLambda: { type: "number", default: feeDefaults.feeLambda },
    feeVelocity: { type: "number", default: feeDefaults.feeVelocity },
    feeMinPct: { type: "number", default: feeDefaults.feeMinPct },
    feeMaxPct: { type: "number", default: feeDefaults.feeMaxPct },
    tokenXMint: { type: "string", demandOption: true },
    tokenYMint: { type: "string", demandOption: true },
    cValue: { type: "number", default: 0 },
    priceAccountX: { type: "string" },
    priceAccountY: { type: "string" },
  });

export const handler = async (a: InitializePoolStateArgs) => {
  const method = a.multisigSafe
    ? initializePoolStateMultisig
    : initializePoolState;

  render(await method(a));
};
