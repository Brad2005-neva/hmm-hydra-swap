import { test as base, chromium } from "@playwright/test";
import { BrowserContext, Page } from "playwright-core";
import { resolve } from "path";
import { CheckSwapType } from "./dsl";

const extensionPath = resolve(
  __dirname,
  ".extensions/fhmfendgdocmcbmfikdcogofphimnkno"
);

type BrowserName = "chromium";

export function parseVals(value: string) {
  return value.trim().split(":");
}

export const test = base.extend({
  async page(
    { context }: { context: BrowserContext },
    use: (page: Page) => Promise<any>
  ) {
    // First time we are reusing the context, we should create the page.
    let [page] = context.pages();
    if (!page) page = await context.newPage();
    page.on("pageerror", (eee) => {
      console.log("Page has console error!");
      throw eee;
    });
    await use(page);
  },

  async context({ browserName }: any, use: any) {
    const browserTypes = { chromium };

    const launchOptions = {
      // devtools: true,
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      viewport: {
        width: 600,
        height: 1080,
      },
    };
    const browser = browserTypes[browserName as BrowserName];
    const context = await browser.launchPersistentContext("", launchOptions);

    await use(context);
  },
} as any);
let _extId = "";
export function saveExtensionId(id?: string) {
  if (id) _extId = id;
}
export function hasExtensionId() {
  return Boolean(_extId);
}
export function getExtensionLink() {
  return `chrome-extension://${_extId}/index.html`;
}

export async function getExtensionPage(
  context: BrowserContext,
  extensionId: string,
  suffixUrl = undefined
) {
  let matchingUrl: string;
  if (!suffixUrl) {
    matchingUrl = `chrome-extension://${extensionId}`;
  } else {
    matchingUrl = `chrome-extension://${extensionId}${suffixUrl}`;
  }
  const pages = context.pages();
  const foundPages = pages.filter((page) => page.url().includes(matchingUrl));

  if (foundPages.length > 0) return foundPages[0];
  else return undefined;
}

export function getDummyMnemonic() {
  return "despair bubble shove weird dove clog spray camp trust ribbon they explain buyer toward appear skill oxygen sheriff elder sick fashion protect peanut enrich";
}

export function getUserAccounts() {
  return [
    {
      name: "Trader",
      keyfile: resolve(
        __dirname,
        "../../../keys/users/usrQpqgkvUjPgAVnGm8Dk3HmX3qXr1w4gLJMazLNyiW.json"
      ),
    },
    {
      name: "Treasury",
      keyfile: resolve(
        __dirname,
        "../../../keys/users/god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D.json"
      ),
    },
  ];
}

export function parseCheckSwapVals({
  tokenA,
  tokenB,
  tokenABal,
  tokenBBal,
  tokenASwap,
  tokenBSwap,
  tokenAExchange,
  tokenBExchange,
  gasFee = 0,
  ammTokenSwap,
}: CheckSwapType) {
  const balanceSumA =
    tokenA === "wSOL"
      ? Number((tokenABal - tokenASwap - gasFee).toFixed(9))
      : tokenABal - tokenASwap;
  const balanceSumB =
    tokenB === "wSOL"
      ? Number(
          (
            tokenBBal +
            (ammTokenSwap ? ammTokenSwap : tokenBSwap) -
            gasFee
          ).toFixed(9)
        )
      : tokenBBal + (ammTokenSwap ? ammTokenSwap : tokenBSwap);

  return {
    checkBalancesA: `${tokenA}:${tokenABal.toLocaleString("en-US")}`,
    checkBalancesB: `${tokenB}:${tokenBBal.toLocaleString("en-US")}`,
    inlineBalanceA: `${tokenA}:${tokenABal.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
    inlineBalanceB: `${tokenB}:${tokenBBal.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
    exchangeRateA: `${tokenB}:${tokenAExchange.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
    exchangeRateB: `${tokenA}:${tokenBExchange.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
    checkBalanceSumA: `${tokenA}:${balanceSumA.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
    checkBalanceSumB: `${tokenB}:${balanceSumB.toLocaleString("en-US", {
      maximumFractionDigits: 20,
    })}`,
  };
}
