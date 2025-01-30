import { expect } from "@playwright/test";
import { Page } from "playwright-core";
import { logMethodCalls } from "./logMethodCalls";
import { navigateViaMenu } from "./utils";

export class PoolsPage {
  constructor(private page: Page) {}
  static new(page: Page) {
    return logMethodCalls(new PoolsPage(page));
  }
  async navigate() {
    await this.page.bringToFront();

    if (this.page.url() !== "http://localhost:3000/#/pools")
      await this.page.goto("http://localhost:3000/#/pools");
  }

  async navigateViaMenu() {
    await this.page.bringToFront();
    await navigateViaMenu(this.page, "Pools");
  }

  async openDepositModal(pool: string) {
    await this.page
      .locator(`[aria-label="${pool}"] button:has-text("Deposit")`)
      .click();
    // Wait for pool streams to load
    await this.page.waitForTimeout(100);
  }

  async setTokenAmount(type: string, amount: string) {
    await this.page
      .locator(`[aria-label="Deposit Liquidity ${type}"] input`)
      .fill(amount);
  }

  async expectTokenAmount(type: string, amount: string) {
    await this.page.waitForSelector(
      `[aria-label="Deposit Liquidity ${type}"] input[value="${amount}"]`
    );
  }

  async doDeposit() {
    await this.page.locator(`[aria-label="Trigger Deposit"]`).click();
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      await this.page.locator('[aria-label="Confirm Trigger Deposit"]').click(),
    ]);

    await popup.reload();
    // Approve
    await popup.locator('button:has-text("Approve")').click();
    await this.page.locator("text=Close").click();
  }

  async attemptDeposit() {
    console.count();
    await this.page.locator(`[aria-label="Trigger Deposit"]`).click();
    console.count();

    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      await this.page.locator('[aria-label="Confirm Trigger Deposit"]').click(),
    ]);
    console.count();

    await popup.reload();
    console.count();

    // Approve
    await popup.locator('button:has-text("Approve")').click();
    console.count();
  }

  async transactionRejected() {
    await this.page.locator("text=Transaction Rejected").isVisible();
    await this.page.locator("text=Dismiss").click();
  }

  async openWithdrawModal(pool: string) {
    await this.page
      .locator(`[aria-label="${pool}"] button:has-text("Withdraw")`)
      .click();
  }

  async clickRatioAmount(ratio: string) {
    await this.page
      .locator(
        `[aria-label="Withdraw Liquidity Setting"] span.MuiSlider-markLabel:has-text("${ratio}%")`
      )
      .click();
  }

  async expectRatioAmount(ratio: string) {
    await this.page.waitForTimeout(100);
    const value = await this.page.inputValue(
      `[aria-label="Withdraw Liquidity Setting"] input`
    );
    expect(value).toBe(ratio);
  }

  async doWithdraw() {
    await this.page.locator(`[aria-label="Trigger Withdraw"]`).click();
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      await this.page
        .locator('[aria-label="Confirm Trigger Withdraw"]')
        .click(),
    ]);
    await popup.reload();

    // Approve
    await popup.locator('button:has-text("Approve")').click();
    await this.page.locator("text=Close").click();
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
    await this.openDepositModal(`Pool ${tokenA}-${tokenB}`);
    const tokenABalance = await this.page.textContent(
      `[aria-label="Token ${tokenA} Balance"]`
    );
    const tokenBBalance = await this.page.textContent(
      `[aria-label="Token ${tokenB} Balance"]`
    );
    expect(tokenABalance).toBe(`Balance: ${tokenABal}`);
    expect(tokenBBalance).toBe(`Balance: ${tokenBBal}`);
    await this.page.locator('[aria-label="Close"]').click();
  }

  async expectBurnTokenAmount({ burntAmount }: { burntAmount: string }) {
    const tokens = await this.page.textContent(
      `[aria-label="Burnt Tokens Amount"]`
    );
    expect(tokens).toBe(burntAmount);
  }

  async expectWithdrawnTokenAmount({
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
    const tokenAWithdraw = await this.page.textContent(
      `[aria-label="Token ${tokenA} Percent"]`
    );
    const tokenBWithdraw = await this.page.textContent(
      `[aria-label="Token ${tokenB} Percent"]`
    );
    expect(tokenAWithdraw).toBe(`${tokenABal} ${tokenA}`);
    expect(tokenBWithdraw).toBe(`${tokenBBal} ${tokenB}`);
  }

  async expectPoolLiquidity({
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
    const tokenAPool = await this.page.textContent(
      `[aria-label="Token ${tokenA} Pool"]`
    );
    const tokenBPool = await this.page.textContent(
      `[aria-label="Token ${tokenB} Pool"]`
    );
    expect(tokenAPool).toBe(`${tokenABal} ${tokenA}`);
    expect(tokenBPool).toBe(`${tokenBBal} ${tokenB}`);
  }

  async expectPoolTVL(
    poolName: string,
    usdAmount: string,
    lpTokenAmount: string
  ) {
    const totalLiquidity = await this.page.textContent(
      `[aria-label="Pool ${poolName}"] [aria-label="Total Liquidity"]`
    );
    expect(totalLiquidity).toBe(`${usdAmount}${lpTokenAmount} LP Tokens`);
  }

  async switchToLiquidity() {
    await this.page.reload();
    await this.page.locator("text=My liquidity").click();
  }

  async expectMyLiquidity(
    poolName: string,
    usdAmount: string,
    lpTokenAmount: string,
    share: string
  ) {
    await this.page.waitForSelector(
      `css=[aria-label="Pool ${poolName}"] [aria-label="Your Liquidity"] >> text=${usdAmount}${lpTokenAmount} LP Token`,
      { timeout: 2000 }
    );
    await this.page.waitForSelector(
      `css=[aria-label="Pool ${poolName}"] [aria-label="Your Share"] >> text=${share} %`,
      { timeout: 2000 }
    );
  }

  async expectPageMessage(message: string) {
    const pageMessage = await this.page.textContent(
      `[aria-label="Page Message"]`
    );
    expect(pageMessage).toBe(message);
  }

  async expectCValue({ cValue }: { cValue: string }) {
    const exchangeRateText = await this.page.textContent(
      `[aria-label="cValue Amount"]`
    );
    expect(exchangeRateText).toBe(cValue);
  }

  async expectFeePopover({
    label,
    message,
  }: {
    label: string;
    message: string;
  }) {
    await this.page.locator(`[aria-label="${label}"]`).click();
    const popoverTextText = await this.page.textContent(
      `[aria-label="popover"]`
    );
    await this.page.locator(`[aria-label="popover"]`).click();

    expect(popoverTextText).toBe(message);
  }
  async getPoolItemCount() {
    return await this.page.locator('[aria-label="Pool Listing"]').count();
  }

  async write_closeDialog() {
    return await this.page.locator('[aria-label="Close"]').click();
  }

  async read_expectDepositButtonDisabled() {
    const depositButton = await this.page
      .locator(`[aria-label="Trigger Deposit"]`)
      .isDisabled();
    expect(depositButton).toBeTruthy();
  }

  async read_expectSwapButtonDisabled() {
    const swapButton = await this.page
      .locator(`[aria-label="Trigger Swap"]`)
      .isDisabled();
    expect(swapButton).toBeTruthy();
  }
}
