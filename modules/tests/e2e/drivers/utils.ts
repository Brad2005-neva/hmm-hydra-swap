// generally this will consist of page objects that hold all the
import { getPrivateKey } from "@hydraprotocol/sdk/node";
import { BrowserContext, Page } from "playwright-core";
import {
  getDummyMnemonic,
  getExtensionLink,
  hasExtensionId,
  saveExtensionId,
} from "../utils";
import { test } from "@playwright/test";
import { getUserAccounts } from "../utils";
import { resetState } from "@hydraprotocol/val";
import { UserTypes } from "../types";

export function prepareEnv(alias = "e2e") {
  test.beforeEach(resetState(alias));
  test.beforeEach(async ({ context }) => {
    await setupWalletExtension(context, getUserAccounts());
  });
}

export async function navigateViaMenu(page: Page, buttonLabel: string) {
  const menuButton = await page.$('[aria-label="Menu Handler"]');
  if (menuButton) {
    await menuButton.click();
  }
  await page.locator(`[aria-label="${buttonLabel}"]`).click();
  if (menuButton) {
    await menuButton.click();
  }
}

export async function getWalletExtensionPage(context: BrowserContext) {
  const newPage = await context.newPage();
  if (!hasExtensionId()) {
    await newPage.goto("chrome://extensions/");

    // Click text=Developer mode This setting is managed by your administrator. >> #bar
    await newPage
      .locator(
        "text=Developer mode This setting is managed by your administrator. >> #bar"
      )
      .click();

    const txt = await newPage.locator("#extension-id").textContent();
    const id = txt?.replace(/^ID: /, "");
    if (!id) throw new Error("Could not find extension ID");

    saveExtensionId(id);
  }
  await newPage.goto(getExtensionLink());
  return newPage;
}

export async function setupWalletExtension(
  context: BrowserContext,
  userAccounts: {
    name: string;
    keyfile: string;
  }[]
) {
  console.log("Setting up wallet extension...");
  const newPage = await getWalletExtensionPage(context);

  // Click text=Restore existing wallet
  await newPage.locator("text=Restore existing wallet").click();
  // Click textarea
  await newPage.locator("textarea").click();
  // Fill textarea
  await newPage.locator("textarea").fill(getDummyMnemonic());
  // Click button:has-text("Next")
  await newPage.locator('button:has-text("Next")').click();
  // Click button:has-text("Restore")
  await newPage.locator('button:has-text("Restore")').click();
  // Click button:has-text("Mainnet Beta")
  await newPage.locator('button:has-text("Mainnet Beta")').click();
  // Click text=http://localhost:8899
  await newPage.locator("text=http://localhost:8899").click();

  for (const { keyfile, name } of userAccounts) {
    console.log("Setting up user account...");
    // await addSolletAccount(page, name, );
    const privateKey = await getPrivateKey(keyfile);
    // Click button:has-text("Account")
    await newPage.locator('button:has-text("Account")').click();
    // Click text=Add Account
    await newPage.locator("text=Add Account").click();
    // Check input[type="checkbox"]
    await newPage.locator('input[type="checkbox"]').check();
    // Click input[type="text"]
    await newPage.locator('input[type="text"]').click();
    // Fill input[type="text"]
    await newPage.locator('input[type="text"]').fill(name);
    // Click input[type="password"]
    await newPage.locator('input[type="password"]').click();
    // Fill input[type="password"]
    await newPage.locator('input[type="password"]').fill(privateKey);
    // Click button:has-text("Add")
    await newPage.locator('button:has-text("Add")').click();
  }

  await newPage.close();
  console.log("Finished setting up wallet extension");
}

export async function selectWalletAccount(
  context: BrowserContext,
  userAccount: UserTypes
) {
  const newPage = await getWalletExtensionPage(context);
  // Click button:has-text("Account")
  await newPage.locator('button:has-text("Account")').click();
  // Click text=Trader (imported)
  await newPage.locator("text=Main account").click();

  if (userAccount === "trader") {
    // Click button:has-text("Account")
    await newPage.locator('button:has-text("Account")').click();
    // Click text=Trader (imported)
    await newPage.locator("text=Trader (imported)").click();
  }
  if (userAccount === "treasury") {
    // Click button:has-text("Account")
    await newPage.locator('button:has-text("Account")').click();
    // Click text=Trader (imported)
    await newPage.locator("text=Treasury (imported)").click();
  }
  await newPage.close();
}
