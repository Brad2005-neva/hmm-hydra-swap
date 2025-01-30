/* eslint-disable @typescript-eslint/no-empty-function */
import { prepareEnv, LiquidityPoolsTest } from "../dsl";
import { HydraContracts } from "../drivers/HydraContracts";
import { test } from "../utils";
import * as pythAccounts from "../../protocol/fixtures/index.json";
import { PublicKey } from "@solana/web3.js";
import testData from "../../protocol/fixtures/e2e_integrated.json";

test.describe("Swap tests", () => {
  prepareEnv("e2e");

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const scenario = testData.find(
    ({ description }) => description === "HMM swap"
  )!;

  test("view pools with varying c values", async ({ context }) => {
    const sdk = new HydraContracts("treasury");

    // Create an HMM pool
    await sdk.createPool(
      "wSOL",
      1_000n * 10n ** 9n,
      "USDC",
      110_000n * 10n ** 6n,
      150,
      new PublicKey(pythAccounts.sol_usd.priceAccount),
      new PublicKey(pythAccounts.usdc_usd.priceAccount)
    );

    // Create another HMM pool with a different c value
    await sdk.createPool(
      "wSOL",
      1_000n * 10n ** 9n,
      "USDC",
      110_000n * 10n ** 6n,
      100,
      new PublicKey(pythAccounts.sol_usd.priceAccount),
      new PublicKey(pythAccounts.usdc_usd.priceAccount)
    );

    const app = new LiquidityPoolsTest(context, "Multiple pools");
    await app.setMode("pools");
    await app.connectAs("trader");
    await app.pools_readExpectPoolCount(2);
    await app.close();
  });

  test("Balance check", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "USDC",
      3281000n * 10n ** 6n,
      "wETH",
      1000n * 10n ** 9n,
      0
    );

    const app = new LiquidityPoolsTest(context, "Balance check");
    await app.setMode("swap");
    await app.connectAs("trader");
    // Checking Swap Page Balances
    await app.ensureExpectedBalancesOnSwap("USDC:1,000", "wETH:10");

    // Redirect to Pools page and Check Balance
    await app.redirectPage("Pools");

    await app.ensureExpectedBalancesOnPools("USDC:1,000", "wETH:10");
    await app.close();
  });

  test(`Swap slippage failure`, async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    const poolId = await sdk.createPool(
      "wBTC",
      3281n * 10n ** 8n,
      "wETH",
      45166n * 10n ** 9n
    );

    const app = new LiquidityPoolsTest(context, `Swap slippage failure`);
    await app.setMode("swap");
    await app.connectAs("treasury");

    // Slippage Tolerance : 0.5%
    await app.ensureExpectedSwapPrice("wBTC", "1", "wETH", "13.73421556");
    await app.ensureExchangeFee("0.2");

    const popup = await app.confirmSwap();
    await sdk.swap("wBTC", "3000", "wETH", "21544.145697126", poolId); // Run another sdkSwap here and see slippage amount exceed error

    await app.approveSwap(popup);
    await app.toastFailure("Transaction Rejected");
    await app.swapFailure("Slippage Amount Exceed");

    await app.close();
  });

  test("Swap HMM", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "wSOL",
      BigInt(scenario.liquidity[0].add.xAmount),
      "USDC",
      BigInt(scenario.liquidity[0].add.yAmount),
      Number(scenario.swap[0].c),
      new PublicKey(pythAccounts.sol_usd.priceAccount),
      new PublicKey(pythAccounts.usdc_usd.priceAccount)
    );

    const app = new LiquidityPoolsTest(context, "Swap HMM");

    await app.setMode("swap");
    await app.connectAs("trader");

    // checking wSOL to USDC swap
    await app.checkSwap({
      tokenA: "wSOL",
      tokenB: "USDC",
      tokenABal: 200.01,
      tokenBBal: 1000,
      tokenASwap:
        Number(scenario.fee[0].amount) / 10 ** Number(scenario.swap[0].xScale),
      tokenBSwap:
        Number(scenario.swap[0].expected.deltaY) /
        10 ** Number(scenario.swap[0].yScale),
      tokenAExchange: 12.085637,
      tokenBExchange: 0.082742848,
      exchangeFee: `${
        (Number(scenario.fee[0].expected.feePercentage) / 10 ** 12) * 100
      }`,
      gasFee: 0.00204428,
      cValue: `${Number(scenario.swap[0].c) / 100}`,
      popoverMessage: "Hydra Market Maker",
      ammTokenSwap: Number(285560110) / 10 ** Number(scenario.swap[0].yScale),
    });

    await app.toastSuccess("Transaction Completed");
    await app.close();
  });

  test("Swap with created pool", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool("wBTC", 3281n * 10n ** 8n, "wETH", 45166n * 10n ** 9n);

    const app = new LiquidityPoolsTest(context, `Basic swap`);
    await app.setMode("swap");
    await app.connectAs("trader");

    // Setup swap then navigate to pool to test against navigation bugs
    await app.ensureExpectedSwapPrice("wBTC", "1", "wETH", "13.73421556");
    await app.navigateToPageViaMenu("pools");
    await app.navigateToPageViaMenu("swap");

    // Checking Slippage Tolerance
    await app.ensureSlippageTolerance("0.5");

    // Check to ensure Scientific Numbers do not appear
    await app.wallets_readCheckBalances("wBTC:5", "wETH:10");
    await app.ensureExpectedSwapPrice(
      "wBTC",
      "5555555555555555555555",
      "wETH",
      "0.00000055"
    );
    await app.ensureExchangeRate("wBTC:1", "wETH:11");

    await sdk.createPool(
      "wSOL",
      BigInt(scenario.liquidity[0].add.xAmount),
      "USDC",
      BigInt(scenario.liquidity[0].add.yAmount)
    );

    // checking wSOL to USDC swap
    await app.checkSwap({
      tokenA: "wSOL",
      tokenB: "USDC",
      tokenABal: 200.01,
      tokenBBal: 1000,
      tokenASwap:
        Number(scenario.fee[0].amount) / 10 ** Number(scenario.swap[0].xScale),
      tokenBSwap: Number(285560110) / 10 ** Number(scenario.swap[0].yScale),
      tokenAExchange: 13.728851,
      tokenBExchange: 0.072839305,
      exchangeFee: `${
        (Number(scenario.fee[0].expected.feePercentage) / 10 ** 12) * 100
      }`,
      gasFee: 0.00204428,
      popoverMessage: "Percent fee",
    });

    await app.toastSuccess("Transaction Completed");
    await app.close();
  });
});
