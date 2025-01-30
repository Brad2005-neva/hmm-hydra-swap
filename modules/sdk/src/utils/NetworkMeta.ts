import { Network } from "../types";
import NetworkMap from "@hydraprotocol/config/network-map.json";

export type NetworkMeta = {
  network: Network;
  endpoint: string;
  name: string;
};

export type NetworkLookupType = { [n in Network]: NetworkMeta };

// Map
export const NetworkLookup: NetworkLookupType = {
  localnet: {
    network: Network.LOCALNET,
    endpoint: "http://127.0.0.1:8899",
    name: "Localnet",
  },
  devnet: {
    network: Network.DEVNET,
    endpoint: NetworkMap[Network.DEVNET],
    name: "Devnet",
  },
  "mainnet-beta": {
    network: Network.MAINNET_BETA,
    endpoint: NetworkMap[Network.MAINNET_BETA],
    name: "Mainnet Beta",
  },
  "fake-mainnet": {
    network: Network.FAKE_MAINNET,
    endpoint: NetworkMap[Network.FAKE_MAINNET],
    name: "Mainnet*",
  },
  testnet: {
    network: Network.TESTNET,
    endpoint: NetworkMap[Network.TESTNET],
    name: "Testnet",
  },
};

// Accessor
export function getNetworkMeta(network: Network) {
  return NetworkLookup[network];
}
