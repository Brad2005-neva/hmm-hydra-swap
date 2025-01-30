// This is not run with anchor migrate
import * as anchor from "@project-serum/anchor";
import { Network } from "@hydraprotocol/sdk";
import { initialize } from "./libs/initialize";
import config from "@hydraprotocol/config/global-config.json";
import { initializeFaucet } from "./libs/initializeFaucet";

export default async function (provider: anchor.AnchorProvider) {
  await initialize(provider, Network.LOCALNET, {
    tokens: [
      { symbol: "usdc", amount: 100000000000000n },
      { symbol: "wbtc", amount: 100000000n * 100000000n },
      { symbol: "weth", amount: 1000000000000000000n },
      {
        symbol: "wsol",
        amount: 450000n * 1000000000n,
      },
    ],
    pools: [],
    demoAccount: {
      tokens: [
        { symbol: "usdc", amount: 1000n * 1000000n },
        { symbol: "wbtc", amount: 500n * 1000000n },
        { symbol: "weth", amount: 10000n * 1000000n },
        { symbol: "wsol", amount: 200n * 1000000000n },
      ],
      demoAccountKey: config.localnet.users.trader,
    },
  });

  await initializeFaucet(provider, Network.LOCALNET);
}
