import { Network } from "@hydraprotocol/sdk";
import { getPythPrices } from "./pyth";
import { getBinancePrices } from "./binance";

export class PricesService {
  getPythPrices = getPythPrices;
  getBinancePrices = getBinancePrices;

  async fetchPrices(network: Network) {
    // If we are testing locally or in e2e tests we use canned values
    if (network === "localnet") {
      const feedMock = {
        USDC: 1,
        wBTC: 20845.73154198,
        wETH: 1199.17984458,
        wSOL: 10.670548,
      };
      return {
        oracle: feedMock,
        rest: feedMock,
      };
    }

    const [pricesData, oraclePrices] = await Promise.all([
      this.getBinancePrices(network),
      this.getPythPrices(network),
    ]);

    return {
      oracle: oraclePrices,
      rest: pricesData ?? oraclePrices,
    };
  }

  static new() {
    return new PricesService();
  }
}
