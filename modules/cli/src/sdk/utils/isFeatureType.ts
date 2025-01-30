import { FeatureType } from "@hydraprotocol/sdk";

export function isFeatureType(type: string): type is FeatureType {
  return Object.values(FeatureType).includes(type as any);
}
