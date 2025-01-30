import { getNetworkMeta, Network } from "@hydraprotocol/sdk";
import { Cluster, Connection } from "@solana/web3.js";
import {
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { getTokenList } from "@hydraprotocol/sdk";
import { ensure } from "../../utils";

const NetworkToCluster: Record<
  | Network.DEVNET
  | Network.FAKE_MAINNET
  | Network.MAINNET_BETA
  | Network.TESTNET,
  Cluster
> = {
  devnet: "devnet",
  "fake-mainnet": "devnet",
  "mainnet-beta": "mainnet-beta",
  testnet: "testnet",
};

export const getPythPrices = async (network: Network) => {
  // Use the cluster we are pointed at
  if (network === Network.LOCALNET)
    throw new Error("Not allowed to get pyth prices from localnet");
  const { endpoint } = getNetworkMeta(network);
  const cluster = NetworkToCluster[network];
  const connection = new Connection(endpoint);
  const pythPublicKey = getPythProgramKeyForCluster(cluster);
  const pythClient = new PythHttpClient(connection, pythPublicKey);
  const tokenLists = getTokenList(network);
  const data = await pythClient.getData();
  const oraclePrices: Record<string, number> = {};
  tokenLists.forEach((token) => {
    const tokenSymbol = `Crypto.${tryToPythSymbol(token.symbol)}/USD`;
    const productPrice = ensure(
      data.productPrice.get(tokenSymbol),
      `Pyth productPrice has no tokenSymbol ${tokenSymbol}`
    );

    if (productPrice) {
      oraclePrices[token.symbol] = productPrice.price || 0;
    }
  });

  return oraclePrices;
};
export const PythSymbolMap = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  USDC: "USDC",
  wBTC: "BTC",
  wETH: "ETH",
  wSOL: "SOL",
};

export function tryToPythSymbol(symbol: string): string {
  const pythMap = PythSymbolMap as any;
  return pythMap[symbol] ?? symbol;
}
