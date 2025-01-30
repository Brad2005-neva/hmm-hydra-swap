import { Ctx } from "../../types";
import { SystemProgram } from "@solana/web3.js";
import { web3 } from "@project-serum/anchor";
import { LoaderFinder } from "../LoaderFinder";

export async function initializeGlobalState(ctx: Ctx) {
  const program = ctx.programs.hydraLiquidityPools;
  const globalStateLoader = LoaderFinder.fromCtx(ctx).globalState();
  const globalStateKey = await globalStateLoader.key();
  const globalStateBump = await globalStateLoader.bump();

  const [programData, _] = await web3.PublicKey.findProgramAddress(
    [program.programId.toBuffer()],
    new web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const ixAccs = {
    admin: ctx.provider.wallet.publicKey,
    globalState: globalStateKey,
    systemProgram: SystemProgram.programId,
    rent: web3.SYSVAR_RENT_PUBKEY,
    program: program.programId,
    programData,
  };

  ctx.log({
    globalStateBump,
    ...ixAccs,
  });

  return program.methods
    .initializeGlobalState(globalStateBump)
    .accounts(ixAccs);
}
