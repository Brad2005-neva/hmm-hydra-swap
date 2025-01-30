// dsl.ts - connect our acceptance tests to the underlying drivers.
// This accounts for when broader system structure changes

import { BrowserContext, expect } from "@playwright/test";
import { Page } from "playwright-core";
import { UserTypes } from "../types";
import { parseCheckSwapVals, parseVals } from "../utils";
import { PoolsPage, SwapPage, WalletPage } from "../drivers";
export { prepareEnv } from "../drivers";
// NOTE: The idea behind this is we might want to break down the swapping to multi-page for web and have single page for mobile.
// This should allow us to run the same test with different strategies.

function logTitle(text: string) {
  console.log("\n".padEnd(text.length + 1 + 4, "="));
  console.log("  " + text + "  ");
  console.log("\n".padStart(text.length + 1 + 4, "="));
}

export type CheckSwapType = {
  tokenA: string;
  tokenB: string;
  tokenABal: number;
  tokenBBal: number;
  tokenASwap: number;
  tokenBSwap: number;
  tokenAExchange: number;
  tokenBExchange: number;
  exchangeFee: string;
  gasFee?: number;
  cValue?: string;
  popoverMessage?: string;
  ammTokenSwap?: number;
};

// For now this will be delegating lots of calls to page objects.
export class LiquidityPoolsTest {
  private page: Page;
  constructor(private context: BrowserContext, description: string) {
    logTitle(description);
    // this is temporary and should be removed once the welcome message is gone.
    this.context.addCookies([
      { name: "hasSeenWelcome", value: "1", url: "http://localhost:3000" },
    ]);
    [this.page] = this.context.pages();
  }

  async connectAs(who: UserTypes) {
    console.log(`connectAs`, who);
    await WalletPage.new(this.page).connectTo(who);
  }

  async setMode(mode: "swap" | "pools") {
    if (mode === "swap") await SwapPage.new(this.page).navigate();
    if (mode === "pools") await PoolsPage.new(this.page).navigate();
  }

  async navigateToPageViaMenu(page: "swap" | "pools") {
    if (page === "swap") await SwapPage.new(this.page).navigateViaMenu();
    if (page === "pools") await PoolsPage.new(this.page).navigateViaMenu();
  }

  async close() {
    await this.page.close();
    await this.context.close();
  }

  async wallets_readCheckBalances(
    tokenAExpected: string,
    tokenBExpected: string
  ) {
    console.log(`wallets_readCheckBalances`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;

    await WalletPage.new(this.page).ensureWalletBalances({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async ensureInlineBalances(tokenAExpected: string, tokenBExpected: string) {
    console.log(`checkInlineBalances`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;

    const swapPage = SwapPage.new(this.page);
    await swapPage.expectInlineBalance({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async ensureSlippageTolerance(expected: string) {
    console.log(`checkSlippageTolerance`, expected);

    const swapPage = SwapPage.new(this.page);
    await swapPage.expectSlippageTolerance(expected);
  }

  async ensureExchangeRate(tokenAExpected: string, tokenBExpected: string) {
    console.log(`checkExchangeRate`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, _tokenABal] = valsA;
    const [tokenB, tokenBRatio] = valsB;

    const swapPage = SwapPage.new(this.page);
    await swapPage.expectExchangeRate({
      tokenA,
      tokenB,
      tokenBRatio,
    });
  }

  async ensureClickExchangeToggle() {
    const swapPage = SwapPage.new(this.page);
    await swapPage.clickExchangeToggle();
  }

  async ensureExpectedSwapPrice(
    tokenA: string,
    tokenAAmount: string,
    tokenB: string,
    expectedSwapPrice: string
  ) {
    console.log(`ensureExpectedSwapPrice`, {
      tokenA,
      tokenAAmount,
      tokenB,
      expectedSwapPrice,
    });
    const swapPage = SwapPage.new(this.page);
    await swapPage.setTokenAType(tokenA);
    await swapPage.setTokenBType(tokenB);
    await swapPage.setTokenAAmount(tokenAAmount);
    await swapPage.expectTokenBAmount(expectedSwapPrice);
  }

  async ensureExchangeFee(amount: string) {
    console.log(`ensureExchangeFee`, {
      amount,
    });
    const swapPage = SwapPage.new(this.page);
    await swapPage.expectExchangeFee({
      amount,
    });
  }

  async pools_writeSetDepositAmounts(
    tokenA: string,
    tokenAAmount: string,
    tokenB: string,
    tokenBAmount?: string
  ) {
    console.log(`pools_writeSetDepositAmounts`, {
      tokenA,
      tokenAAmount,
      tokenB,
    });
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.openDepositModal(`Pool ${tokenA}-${tokenB}`);
    await poolsPage.setTokenAmount(tokenA, tokenAAmount);
    if (tokenBAmount) {
      await poolsPage.setTokenAmount(tokenB, tokenBAmount);
    }
  }

  async pools_readExpectPoolCount(expected: number) {
    console.log(`pools_readExpectPoolCount`, {
      expected,
    });
    const poolsPage = PoolsPage.new(this.page);
    const count = await poolsPage.getPoolItemCount();
    expect(count).toBe(expected);
  }

  async pools_writeOpenDepositDialog(tokenA: string, tokenB: string) {
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.openDepositModal(`Pool ${tokenA}-${tokenB}`);
  }
  async pools_writeCloseDepositDialog() {
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.write_closeDialog();
  }

  async ensureExpectedDepositRatio(
    tokenA: string,
    tokenAAmount: string,
    tokenB: string,
    expectedTokenBAmount: string
  ) {
    console.log(`ensureExpectedDepositRatio`, {
      tokenA,
      tokenAAmount,
      tokenB,
      expectedTokenBAmount,
    });
    await this.pools_writeSetDepositAmounts(tokenA, tokenAAmount, tokenB);
    await PoolsPage.new(this.page).expectTokenAmount(
      tokenB,
      expectedTokenBAmount
    );
  }

  async ensureExpectedWithdrawRatio(
    tokenA: string,
    tokenB: string,
    ratio: string
  ) {
    console.log(`ensureExpectedWithdrawRatio`, {
      tokenA,
      tokenB,
      ratio,
    });
    const poolsPage = PoolsPage.new(this.page);
    console.log("found page");
    await poolsPage.openWithdrawModal(`Pool ${tokenA}-${tokenB}`);
    console.log("opened Modal");
    await poolsPage.clickRatioAmount(ratio);
    console.log("clicked ratio amount");
    await poolsPage.expectRatioAmount(ratio);
  }

  async ensureExpectedWithdrawCValue(
    tokenA: string,
    tokenB: string,
    cValue: string
  ) {
    console.log(`ensureExpectedWithdrawRatio`, {
      tokenA,
      tokenB,
      cValue,
    });
    const poolsPage = PoolsPage.new(this.page);
    console.log("found page");
    await poolsPage.openWithdrawModal(`Pool ${tokenA}-${tokenB}`);
    console.log("opened Modal");
    await poolsPage.expectCValue({
      cValue,
    });
  }

  async confirmSwap() {
    console.log("confirmSwap");

    const popup = await SwapPage.new(this.page).confirmSwap();
    return popup;
  }

  async approveSwap(popup: Page) {
    console.log("approveSwap");

    await SwapPage.new(this.page).approveSwap(popup);
  }

  async swapFailure(error: string) {
    console.log("swapFailure");

    await SwapPage.new(this.page).swapFailure(error);
  }

  async toastFailure(error: string) {
    console.log("toastFailure");

    await SwapPage.new(this.page).toastFailure(error);
  }

  async toastSuccess(success: string) {
    console.log("toastSuccess");

    await SwapPage.new(this.page).toastSuccess(success);
  }

  async swapCurrentTokens() {
    console.log("swapCurrentTokens");

    const swapPage = SwapPage.new(this.page);
    const popup = await swapPage.confirmSwap();
    await swapPage.approveSwap(popup);
    await swapPage.swapSuccess();
  }

  async pools_writeDoDepositCurrentTokens() {
    console.log("pools_writeDoDepositCurrentTokens");
    await PoolsPage.new(this.page).doDeposit();
  }

  async attemptDepositCurrentTokens() {
    console.log("attemptDepositCurrentTokens");
    await PoolsPage.new(this.page).attemptDeposit();
  }

  async ensureTransactionRejected() {
    console.log("ensureTransactionRejected");
    await PoolsPage.new(this.page).transactionRejected();
  }

  async withdrawCurrentTokens() {
    console.log("withdrawCurrentTokens");
    await PoolsPage.new(this.page).doWithdraw();
  }

  async redirectPage(page: string) {
    console.log("redirectPageTo:", page);
    await this.page.locator('[aria-label="Menu Handler"]').click();
    await this.page.locator(`[aria-label="${page}"]`).click();
    await this.page.locator('[aria-label="Menu Handler"]').click();
  }

  async ensureExpectedBalancesOnSwap(
    tokenAExpected: string,
    tokenBExpected: string
  ) {
    console.log(`ensureExpectedBalancesOnSwap`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;

    const swapPage = SwapPage.new(this.page);
    await swapPage.setTokenAType(tokenA);
    await swapPage.setTokenBType(tokenB);
    await swapPage.expectTokenBalances({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async ensureExpectedBalancesOnPools(
    tokenAExpected: string,
    tokenBExpected: string
  ) {
    console.log(
      `ensureExpectedBalancesOnPools`,
      tokenAExpected,
      tokenBExpected
    );

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;

    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectTokenBalances({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async ensureBurntTokenAmount(expected: string) {
    console.log("ensureBurntTokenAmount", expected);
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectBurnTokenAmount({ burntAmount: expected });
  }

  async ensurePoolLiquidity(tokenAExpected: string, tokenBExpected: string) {
    console.log(`ensurePoolLiquidity`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;

    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectPoolLiquidity({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async pools_readEnsurePoolTVL(
    poolName: string,
    usdAmount: string,
    lpTokenAmount: string
  ) {
    console.log(`pools_readEnsurePoolTVL`, {
      poolName,
      usdAmount,
      lpTokenAmount,
    });

    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectPoolTVL(poolName, usdAmount, lpTokenAmount);
  }

  async switchToLiquidity() {
    console.log(`switchtoLiquidity`);

    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.switchToLiquidity();
  }

  async ensurePageMessage(message: string) {
    console.log("ensurePageMessage", message);
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectPageMessage(message);
  }

  async ensureMyLiquidity(
    poolName: string,
    usdAmount: string,
    lpTokenAmount: string,
    share: string
  ) {
    console.log(`ensureMyLiquidity`, {
      poolName,
      usdAmount,
      lpTokenAmount,
      share,
    });

    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectMyLiquidity(
      poolName,
      usdAmount,
      lpTokenAmount,
      share
    );
  }

  async ensureWithdrawnTokenAmount(
    tokenAExpected: string,
    tokenBExpected: string
  ) {
    console.log(`ensureWithdrawnTokenAmount`, tokenAExpected, tokenBExpected);

    const valsA = parseVals(tokenAExpected);
    const valsB = parseVals(tokenBExpected);

    const [tokenA, tokenABal] = valsA;
    const [tokenB, tokenBBal] = valsB;
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectWithdrawnTokenAmount({
      tokenA,
      tokenABal,
      tokenB,
      tokenBBal,
    });
  }

  async ensureCValueDisplay(cValue: string = "") {
    console.log(`checkCValue`, cValue);
    const swapPage = SwapPage.new(this.page);
    await swapPage.expectCValue({
      cValue,
    });
  }

  async ensureExpectedCValue(cValue: string = "") {
    console.log(`checkCValue`, cValue);
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectCValue({
      cValue,
    });
  }

  async ensurePricePopover(message: string = "") {
    console.log(`Price Popover`, message);
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectFeePopover({
      label: "Price Popover",
      message,
    });
  }

  async ensureSwapFeePopover(message: string = "") {
    console.log(`Swap Fee Popover`, message);
    const poolsPage = PoolsPage.new(this.page);
    await poolsPage.expectFeePopover({
      label: "Swap Fee Popover",
      message,
    });
  }

  async ensureExpectedSwapWarning(
    tokenA: string,
    tokenAAmount: string,
    tokenB: string,
    warning: string,
    label: string
  ) {
    console.log(`ensureExpectedSwapWarning`, {
      tokenA,
      tokenAAmount,
      tokenB,
      warning,
      label,
    });
    const swapPage = SwapPage.new(this.page);
    await swapPage.setTokenAType(tokenA);
    await swapPage.setTokenBType(tokenB);
    await swapPage.setTokenAAmount(tokenAAmount);
    await swapPage.expectSwapWarning(warning, label);
  }

  async ensureNoSwapWarning(warning: string, label: string) {
    console.log(`ensureNoSwapWarning`, {
      warning,
      label,
    });
    const swapPage = SwapPage.new(this.page);
    await swapPage.expectNoSwapWarning(warning, label);
  }

  async pools_readEnsureDisabledDepositButton() {
    console.log("ensureDisabledDepositButton");
    await PoolsPage.new(this.page).read_expectDepositButtonDisabled();
  }

  async swap_readEnsureDisabledSwapButton() {
    console.log("ensureDisabledSwapButton");
    await PoolsPage.new(this.page).read_expectSwapButtonDisabled();
  }

  async checkSwap({
    tokenA,
    tokenB,
    tokenABal,
    tokenBBal,
    tokenASwap,
    tokenBSwap,
    tokenAExchange,
    tokenBExchange,
    exchangeFee,
    gasFee,
    cValue,
    popoverMessage = "",
    ammTokenSwap,
  }: CheckSwapType) {
    const {
      checkBalancesA,
      checkBalancesB,
      inlineBalanceA,
      inlineBalanceB,
      exchangeRateA,
      exchangeRateB,
      checkBalanceSumA,
      checkBalanceSumB,
    } = parseCheckSwapVals({
      tokenA,
      tokenB,
      tokenABal,
      tokenBBal,
      tokenASwap,
      tokenBSwap,
      tokenAExchange,
      tokenBExchange,
      exchangeFee,
      gasFee,
      ammTokenSwap,
    });
    await this.wallets_readCheckBalances(checkBalancesA, checkBalancesB);
    await this.ensureExpectedSwapPrice(
      tokenA,
      `${tokenASwap}`,
      tokenB,
      `${tokenBSwap}`
    );
    await this.ensureInlineBalances(inlineBalanceA, inlineBalanceB);
    await this.ensureExchangeRate(`${tokenA}:1`, exchangeRateA);
    await this.ensureClickExchangeToggle();
    await this.ensureExchangeRate(`${tokenB}:1`, exchangeRateB);
    cValue && (await this.ensureCValueDisplay(cValue));
    cValue && (await this.ensurePricePopover(popoverMessage));
    !cValue && (await this.ensureSwapFeePopover(popoverMessage));
    await this.ensureExchangeFee(exchangeFee);
    await this.swapCurrentTokens();
    await this.wallets_readCheckBalances(checkBalanceSumA, checkBalanceSumB);
  }
}
