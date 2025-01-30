import yargs from "yargs";

import { Network } from "@hydraprotocol/sdk";
import { commands as liquidityPoolsCommands } from "./cmds/liquidity-pools";
import { commands as faucetCommands } from "./cmds/faucet";

export async function main() {
  await yargs
    .options({
      network: {
        type: "string",
        choices: [
          Network.DEVNET,
          Network.LOCALNET,
          Network.MAINNET_BETA,
          Network.TESTNET,
          Network.FAKE_MAINNET,
        ],
        describe: "The network to connect to",
        default: Network.MAINNET_BETA,
      },
      walletLocation: {
        type: "string",
        describe: "The location of your filesystem wallet",
        default: "~/.config/solana/id.json",
      },
      multisigSafe: {
        type: "string",
        describe:
          "An address of a multisig safe. When specified the command will propose a multisig transaction instead of sending the transaction directly to the chain.",
      },
      multisigActor: {
        type: "string",
        describe:
          "An address of the multisig actor inside the multisig safe. This will be the account that will be the actor for the transaction.",
      },
    })
    .implies("multisigSafe", "multisigActor")
    .implies("multisigActor", "multisigSafe")
    .command(["liquidity-pools", "lp"], "Manage liquidity pools", (yargs) =>
      yargs.command(liquidityPoolsCommands as any).demandCommand()
    )
    .command("faucet", "Manage faucet", (yargs) =>
      yargs.command(faucetCommands as any).demandCommand()
    )
    .demandCommand(1, "")
    .showHelpOnFail(true)
    .strict()
    .parse();

  // prevent waiting on stream GC
  process.exit(0);
}
