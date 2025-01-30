import { Asset, Network } from "..";
import TokenMap from "@hydraprotocol/config/tokens.json";

type TokenMapType = {
  [k in Network]: Asset[];
};

export function getTokenList(network: Network) {
  const tokens = TokenMap as TokenMapType;
  return tokens[network];
}
