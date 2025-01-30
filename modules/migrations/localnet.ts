// This is not run with anchor migrate
import * as anchor from "@project-serum/anchor";
import { parseJsonFees, Network } from "@hydraprotocol/sdk";
import { initialize } from "./libs/initialize";
import config from "@hydraprotocol/config/global-config.json";
import { initializeFaucet } from "./libs/initializeFaucet";
import fixtureIndex from "@hydraprotocol/tests/protocol/fixtures/index.json";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";

export default async function (provider: anchor.AnchorProvider) {
  const fees = parseJsonFees(feeDefaults);

  await initialize(provider, Network.LOCALNET, {
    tokens: [
      { symbol: "usdc", amount: 100000000000000n },
      { symbol: "wbtc", amount: 100000000n * 100000000n },
      { symbol: "weth", amount: 1000000000000000000n },
      {
        symbol: "wsol",
        amount: 450000n * 1000000000n, // Limit: 1000000n * 1000000000n
      },
    ],
    pools: [
      {
        tokenA: "wbtc",
        tokenB: "usdc",
        tokenAAmount: 1000n * 10n ** 8n,
        tokenBAmount: 45166800n * 10n ** 6n,
        fees,
      },
      {
        tokenA: "wbtc",
        tokenB: "weth",
        tokenAAmount: 3281n * 10n ** 8n,
        tokenBAmount: 45166n * 10n ** 9n,
        fees,
      },
      {
        tokenA: "wbtc",
        tokenB: "wsol",
        tokenAAmount: 1000n * 10n ** 8n,
        tokenBAmount: 660000n * 10n ** 9n,
        fees,
      },
      {
        tokenA: "weth",
        tokenB: "usdc",
        tokenAAmount: 1000n * 10n ** 9n,
        tokenBAmount: 3281000n * 10n ** 6n,
        fees,
      },
      {
        tokenA: "weth",
        tokenB: "wsol",
        tokenAAmount: 1000n * 10n ** 9n,
        tokenBAmount: 40870n * 10n ** 9n,
        fees,
      },
      {
        tokenA: "wsol",
        tokenB: "usdc",
        tokenAAmount: 1_000n * 10n ** 9n,
        tokenBAmount: 110_000n * 10n ** 6n,
        cValue: 150,
        tokenAPrice: fixtureIndex.sol_usd.priceAccount,
        tokenBPrice: fixtureIndex.usdc_usd.priceAccount,
        fees,
      },
    ],
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
