import * as anchor from "@project-serum/anchor";
import config from "@hydraprotocol/config/global-config.json";
import * as benchmarks from "@hydraprotocol/idls/codegen/types/hydra_benchmarks";
import { resetState } from "@hydraprotocol/val";

describe("hydra-benchmarks", () => {
  let program: anchor.Program<benchmarks.HydraBenchmarks>;
  beforeEach(resetState("anchor-fixture"));

  beforeEach(async () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const hydraBenchmarks = new anchor.web3.PublicKey(
      config.localnet.programIds.hydraBenchmarks
    );
    program = new anchor.Program(benchmarks.IDL, hydraBenchmarks);
  });

  it("runs the benchmarked functions on chain", async () => {
    await new Promise((f) => setTimeout(f, 3000));
    await program.methods.decimalBench().rpc(); //       3280 of 200000 compute units
    await program.methods.bigDecimalBench().rpc(); //   15877 of 200000 compute units
    await program.methods.lnBench().rpc(); //          102206 of 200000 compute units
    await program.methods.powBench().rpc(); //          51819 of 200000 compute units
    await program.methods.sqrtBench().rpc(); //         25899 of 200000 compute units
    await program.methods.feesBench().rpc(); //         26785 of 200000 compute units
    await program.methods.swapBench().rpc(); //        159351 of 200000 compute units
  });
});
