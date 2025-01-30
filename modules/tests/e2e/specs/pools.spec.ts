/* eslint-disable @typescript-eslint/no-empty-function */
import { prepareEnv, LiquidityPoolsTest } from "../dsl";
import { HydraContracts } from "../drivers/HydraContracts";
import { test } from "../utils";

test.describe("Liquidity pools", () => {
  prepareEnv("e2e");

  test("Can deposit to empty pool", async ({ context }) => {
    const sdk = new HydraContracts("treasury");

    await sdk.initializePool("USDC", "wETH");
    const app = new LiquidityPoolsTest(context, "Can deposit to empty pool");
    await app.setMode("pools");
    await app.connectAs("trader");
    await app.pools_writeSetDepositAmounts("USDC", "50", "wETH", "0.02");
    await app.pools_writeDoDepositCurrentTokens();
    await app.pools_readEnsurePoolTVL("USDC-wETH", "$74", "1");
    await app.close();
  });

  test("Basic add liquidity", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "USDC",
      3281000n * 10n ** 6n,
      "wETH",
      1000n * 10n ** 9n,
      0
    );
    const app = new LiquidityPoolsTest(context, "Basic add liquidity");

    await app.setMode("pools");
    await app.connectAs("trader");
    await app.wallets_readCheckBalances("USDC:1,000", "wETH:10");

    await app.pools_readEnsurePoolTVL("USDC-wETH", "$4,480,180", "57,280");

    // Open and close dialog to check that flow still functions
    await app.pools_writeOpenDepositDialog("USDC", "wETH");
    await app.pools_writeCloseDepositDialog();

    await app.ensureExpectedDepositRatio("USDC", "50", "wETH", "0.015239256");
    await app.ensurePoolLiquidity("USDC:3,281,000", "wETH:1,000");
    // TODO: app.ensureEstimatedAPR() // XXX: HOW TO CALCULATE THIS IS NOT CLEAR FROM CALCS SHEET
    await app.pools_writeDoDepositCurrentTokens();
    await app.wallets_readCheckBalances("USDC:950", "wETH:9.984760744");
    // testing if over deposit fails.
    await app.ensureExpectedDepositRatio("USDC", "1500", "wETH", "0.457177689");
    await app.pools_readEnsureDisabledDepositButton();
    await app.pools_writeCloseDepositDialog();
    // WITHDRAW
    // await app.switchToLiquidity();
    // await app.ensureMyLiquidity("USDC", "wETH", "0.872024784", "<0.01");
    // test is skipped because of issue #221

    // WITHDRAW
    await app.ensureExpectedWithdrawRatio("USDC", "wETH", "50");
    await app.ensureWithdrawnTokenAmount("USDC:24.999977", "wETH:0.007619621");
    await app.ensureBurntTokenAmount("0.436452");
    await app.withdrawCurrentTokens();
    await app.wallets_readCheckBalances("USDC:974.999976", "wETH:9.992380365");
    // TODO: await app.ensureSlippageTolerance("0.5%")
    // TODO: app.checkFee()

    // TODO: Check "my liquidity"
    // TODO: Check LP toke amount
    await app.close();
  });

  test("My Liquidity", async ({ context }) => {
    const app = new LiquidityPoolsTest(context, "My Liquidity");

    await app.setMode("pools");

    // test my liquidity share percent with treasury account
    // TODO: This test is flawed, as it has a page.reload, and then needs to reconnect as treasury.
    // this will be fixed in issue 221 and the temporary fixes should be removed.
    await app.switchToLiquidity();
    await app.connectAs("treasury");

    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "USDC",
      3281000n * 10n ** 6n,
      "wETH",
      1000n * 10n ** 9n,
      0
    );

    await app.setMode("pools");

    // test my liquidity share percent with treasury account
    // TODO: This test is flawed, as it has a page.reload, and then needs to reconnect as treasury.
    // this will be fixed in issue 221 and the temporary fixes should be removed.
    await app.switchToLiquidity();

    await app.connectAs("treasury");
    await app.ensureMyLiquidity(
      "USDC-wETH",
      "$4,480,179.77",
      "57,280.012966",
      "100"
    );
    await app.close();
  });

  test("view liquidity details", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "USDC",
      3281000n * 10n ** 6n,
      "wETH",
      1000n * 10n ** 9n,
      0
    );

    const app = new LiquidityPoolsTest(context, "view liquidity details");

    await app.setMode("pools");
    await app.connectAs("trader");

    await app.ensureExpectedDepositRatio("USDC", "50", "wETH", "0.015239256");
    await app.pools_writeDoDepositCurrentTokens();

    await app.switchToLiquidity();
    await app.connectAs("trader");

    await app.ensureMyLiquidity("USDC-wETH", "$68.27", "0.872904", "<0.01");
    await app.close();

    // TODO: app.ensureLiquidityPosition("USDC:XXX, wETH:XXX");
    // TODO: app.ensurePoolSharePercent()
    // TODO: app.ensureLPTokens("USDC-wETH","XXX")
    // TODO: app.ensureHYSEarned("XXX")
  });
  // TODO: use derived values from e2e json

  test("basic remove liquidity", async ({ context }) => {
    const sdk = new HydraContracts("treasury");
    await sdk.createPool(
      "USDC",
      3281000n * 10n ** 6n,
      "wETH",
      1000n * 10n ** 9n,
      0
    );

    const app = new LiquidityPoolsTest(context, "basic remove liquidity");

    await app.setMode("pools");
    await app.connectAs("trader");
    await app.wallets_readCheckBalances("USDC:1,000", "wETH:10");

    await app.pools_readEnsurePoolTVL("USDC-wETH", "$4,480,180", "57,280");
    await app.ensureExpectedDepositRatio("USDC", "50", "wETH", "0.015239256");

    await app.ensurePoolLiquidity("USDC:3,281,000", "wETH:1,000");

    await app.pools_writeDoDepositCurrentTokens();
    await app.wallets_readCheckBalances("USDC:950", "wETH:9.984760744");

    // WITHDRAW
    await app.switchToLiquidity();
    await app.connectAs("trader");
    // await app.ensureMyLiquidity("USDC", "wETH", "0.872024784", "<0.01");
    await app.ensureExpectedWithdrawRatio("USDC", "wETH", "100");
    await app.ensureWithdrawnTokenAmount("USDC:49.999953", "wETH:0.015239242");
    await app.ensureBurntTokenAmount("0.872904");
    await app.withdrawCurrentTokens();
    await app.wallets_readCheckBalances("USDC:999.999953", "wETH:9.999999986");
    await app.close();

    // TODO: add remove liquidity test code here
    // TODO: app.ensurePooledAmountOfTokensToRemove("USDC:XXX, wETH:XXX");
    // TODO: app.ensureLPTokensBurnt("USDC-wETH","XXX")
    // TODO: app.ensureHYSHarvested("XXX")
  });
});
