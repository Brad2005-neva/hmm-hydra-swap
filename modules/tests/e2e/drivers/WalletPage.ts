import { expect } from "@playwright/test";
import { Page } from "playwright-core";
import { UserTypes } from "../types";
import { connectToWallet } from "./wallets";
import { logMethodCalls } from "./logMethodCalls";

export class WalletPage {
  constructor(private page: Page) {}
  static new(page: Page) {
    return logMethodCalls(new WalletPage(page));
  }
  async connectTo(who: UserTypes) {
    await connectToWallet(this.page, who);
  }

  async ensureWalletBalances({
    tokenA,
    tokenB,
    tokenABal,
    tokenBBal,
  }: {
    tokenA: string;
    tokenB: string;
    tokenABal: string;
    tokenBBal: string;
  }) {
    await this.page
      .locator(
        'text=SwapPoolsFaucetsLocalnetTest GuideDocs >> [aria-label="View wallet"]'
      )
      .click();
    await expect(
      this.page.locator(`[data-aria-label="${tokenA} balance"]`)
    ).toHaveText(`${tokenABal} ${tokenA}`);
    await expect(
      this.page.locator(`[data-aria-label="${tokenB} balance"]`)
    ).toHaveText(`${tokenBBal} ${tokenB}`);

    await this.page.locator(".MuiBackdrop-root").click();
  }
}
