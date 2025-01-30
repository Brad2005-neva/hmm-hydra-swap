// specific handlers to interact with our system

import { Page } from "playwright-core";
import { selectWalletAccount } from "./utils";
import { UserTypes } from "../types";

export async function connectToWallet(page: Page, who: UserTypes) {
  await selectWalletAccount(page.context(), who);
  await page.bringToFront();
  // await Promise.all([context.waitForEvent("page")]);
  await page.locator('nav button:has-text("Connect")').click();

  // Click button:has-text("Sollet (Extension)")
  const [popup] = await Promise.all([
    page.context().waitForEvent("page"),
    await page.locator('button:has-text("Sollet (Extension)")').click(),
  ]);

  await popup.reload(); // need this not sure why

  // Click button:has-text("Connect")
  await popup.locator('button:has-text("Connect")').click();
}
