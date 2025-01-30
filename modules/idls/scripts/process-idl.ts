import HydraBenchmarks from "../../core/target/idl/hydra_benchmarks.json";
import HydraFaucet from "../../core/target/idl/hydra_faucet.json";
import HydraLiquidityPools from "../../core/target/idl/hydra_liquidity_pools.json";
import { pascalCase } from "pascal-case";

import fs from "fs";
import { main } from "@hydraprotocol/utils-node";

export function generateTemplate(idl: { name: string }) {
  const name = pascalCase(idl.name);

  return `
export type ${name} = ${JSON.stringify(idl, null, 2)};

export const IDL: ${name} = ${JSON.stringify(idl, null, 2)};
`;
}

main(async () => {
  const hydraBenchmarks = generateTemplate(HydraBenchmarks);
  const hydraLiquidityPools = generateTemplate(HydraLiquidityPools);
  const hydraFaucet = generateTemplate(HydraFaucet);

  fs.writeFileSync("./codegen/types/hydra_benchmarks.ts", hydraBenchmarks);
  fs.writeFileSync("./codegen/types/hydra_faucet.ts", hydraFaucet);
  fs.writeFileSync(
    "./codegen/types/hydra_liquidity_pools.ts",
    hydraLiquidityPools
  );
});
