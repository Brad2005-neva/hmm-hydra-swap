import { Asset, getTokenList, Network } from "@hydraprotocol/sdk";

export const getBinancePrices = async (
  network: Network
): Promise<Record<string, number> | undefined> => {
  const pricesData: Record<string, number> = {};

  const tokenLists = getTokenList(network);

  const tokens = tokenLists.map((value: Asset) => {
    pricesData[value.symbol] = 0;
    return tryToBinanceAPISymbol(value.symbol);
  });

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbols=[${tokens
        .map((symbol) => `"${symbol}"`)
        .join(",")}]`
    );
    const data = await response.json();
    data.map((value: any) => {
      const idx = tokens.indexOf(value.symbol);
      if (idx == -1) throw "Unknown symbol while getting from coinapi";
      pricesData[tokenLists[idx].symbol] = value.price ?? 0;
    });
    return pricesData;
  } catch (e) {
    console.log(
      "Could not get binance API Prices data. Returning orcale prices..."
    );
    return undefined;
  }
};

export const BinanceAPISymbolMap = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  USDC: "USDCUSDT",
  wBTC: "BTCUSDT",
  wETH: "ETHUSDT",
  wSOL: "SOLUSDT",
};

export function tryToBinanceAPISymbol(symbol: string): string {
  const coinApiMap = BinanceAPISymbolMap as any;
  return coinApiMap[symbol] ?? symbol;
}
