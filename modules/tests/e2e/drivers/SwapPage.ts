import { expect } from "@playwright/test";
import { Page } from "playwright-core";
import { ExpectInlineBalanceProps } from "../types";
import { logMethodCalls } from "./logMethodCalls";
import { navigateViaMenu } from "./utils";

export class SwapPage {
  constructor(private page: Page) {}
  static new(page: Page) {
    return logMethodCalls(new SwapPage(page));
  }
  async pause() {
    await this.page.pause();
  }
  async navigate() {
    await this.page.bringToFront();

    if (this.page.url() !== "http://localhost:3000")
      await this.page.goto("http://localhost:3000");
  }

  async navigateViaMenu() {
    await this.page.bringToFront();
    await navigateViaMenu(this.page, "Swap");
  }

  async setTokenAType(type: string) {
    await this.page.locator('[aria-label="Select token A"]').click();
    await this.page.locator(`[aria-label="Select ${type}"]`).click();
  }

  async setTokenBType(type: string) {
    await this.page.locator('[aria-label="Select token B"]').click();
    await this.page.locator(`[aria-label="Select ${type}"]`).click();
  }

  async setTokenAAmount(amount: string) {
    await this.page.locator('[aria-label="Token A Amount"] input').fill(amount);
  }

  async expectTokenBAmount(amount: string) {
    await this.page.waitForSelector(
      `[aria-label="Token B Amount"] input[value="${amount}"]`
    );
  }

  async expectInlineBalance({
    tokenA,
    tokenABal,
    tokenB,
    tokenBBal,
  }: ExpectInlineBalanceProps) {
    const valueA = await this.page.textContent(
      `[aria-label="${tokenA} inline balance"]`
    );
    const valueB = await this.page.textContent(
      `[aria-label="${tokenB} inline balance"]`
    );
    expect(valueA).toBe(`Balance: ${tokenABal}`);
    expect(valueB).toBe(`Balance: ${tokenBBal}`);
  }

  async expectSlippageTolerance(fee: string) {
    await this.page.locator(`[aria-label="Slippage Setting"]`).click();
    const value = await this.page.inputValue(
      '[aria-label="Slippage Fee"] input'
    );
    expect(value).toBe(fee);
    await this.page.locator(`[aria-label="Close"]`).click();
  }

  async expectExchangeRate({
    tokenA,
    tokenB,
    tokenBRatio,
  }: {
    tokenA: string;
    tokenB: string;
    tokenBRatio: string;
  }) {
    const exchangeRateText = await this.page.textContent(
      `[aria-label="Exchange Rate Text"]`
    );
    expect(exchangeRateText).toBe(`1 ${tokenA} = ${tokenBRatio} ${tokenB}`);
  }

  async clickExchangeToggle() {
    await this.page.locator('[aria-label="Exchange Rate Toggle"]').click();
  }

  async expectExchangeFee({ amount }: { amount: string }) {
    await this.page.locator(`[aria-label="Trigger Swap"]`).click();
    const exchangeFeeText = await this.page.textContent(
      `[aria-label="Exchange Fee Text"]`
    );
    expect(exchangeFeeText).toBe(`${amount}%`);
  }

  async confirmSwap() {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      await this.page.locator('[aria-label="Confirm Trigger Swap"]').click(),
    ]);

    return popup;
  }

  async approveSwap(popup: Page) {
    await popup.reload();
    await popup.locator('button:has-text("Approve")').click();
  }

  async swapSuccess() {
    await this.page.waitForTimeout(1000);
    await this.page.locator('[aria-label="Close"]').click();
  }

  async swapFailure(error: string) {
    await this.page.waitForTimeout(1000);

    const transactionError = await this.page.textContent(
      `[aria-label="Transaction Error"]`
    );
    expect(transactionError).toBe(`${error}`);

    await this.page.locator('[aria-label="Close"]').click();
  }

  async toastFailure(error: string) {
    await this.page.waitForTimeout(1000);

    const toastify = await this.page.locator(".Toastify");

    console.log({ toastify });
    const toastText = await toastify.allTextContents();
    console.log({ toastText });
    expect(toastText.length).toBe(1);
    expect(toastText).toContain(`${error}`);
  }

  async toastSuccess(success: string) {
    await this.page.waitForTimeout(1000);

    const toastify = await this.page.locator(".Toastify");

    console.log({ toastify });
    const toastText = await toastify.allTextContents();
    console.log({ toastText });

    expect(toastText.length).toBe(1);
    expect(toastText).toContain(`${success}`);
  }

  async expectSwapWarning(warning: string, label: string) {
    const transactionError = await this.page.textContent(
      `[aria-label="${label}"]`
    );
    expect(transactionError).toBe(`${warning}`);
  }

  async expectNoSwapWarning(warning: string, label: string) {
    const transactionError = await this.page.isVisible(
      `[aria-label="${label}"]`
    );
    expect(transactionError).toBeFalsy();
  }

  async expectTokenBalances({
    tokenA,
    tokenABal,
    tokenB,
    tokenBBal,
  }: {
    tokenA: string;
    tokenABal: string;
    tokenB: string;
    tokenBBal: string;
  }) {
    const tokenABalance = await this.page.textContent(
      `[aria-label="${tokenA} inline balance"]`
    );
    const tokenBBalance = await this.page.textContent(
      `[aria-label="${tokenB} inline balance"]`
    );

    expect(tokenABalance).toContain(tokenABal);
    expect(tokenBBalance).toContain(tokenBBal);
  }

  async expectCValue({ cValue }: { cValue: string }) {
    const exchangeRateText = await this.page.textContent(
      `[aria-label="cValue Amount"]`
    );
    expect(exchangeRateText).toContain(cValue);
  }
}
