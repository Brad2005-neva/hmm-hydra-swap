import { PriceData, PythHttpClient } from "@pythnetwork/client";
import { Connection, PublicKey } from "@solana/web3.js";
import NetworkMap from "@hydraprotocol/config/network-map.json";
import { Network } from "@hydraprotocol/sdk";

export const PythKey = {
  DEVNET: "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
  TESTNET: "8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz",
  MAINNET: "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH",
};

export async function getPythPrices(symbols?: string[]) {
  // live fetch pyth proces for specific pairs.
  const connection = new Connection(NetworkMap[Network.DEVNET]);
  const pythClient = new PythHttpClient(
    connection,
    new PublicKey(PythKey.DEVNET)
  );
  const data = await pythClient.getData();

  const prices: PriceData[] = [];
  for (const symbol of symbols ?? data.symbols) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const price = data.productPrice.get(symbol)!;
    prices.push(price);
  }
  return prices;
}
