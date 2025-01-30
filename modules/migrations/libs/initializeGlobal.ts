import { HydraSDK } from "@hydraprotocol/sdk";

export async function initializeGlobal(sdk: HydraSDK) {
  await sdk.liquidityPools.initializeGlobalState();
  console.log(`Done`);
}
