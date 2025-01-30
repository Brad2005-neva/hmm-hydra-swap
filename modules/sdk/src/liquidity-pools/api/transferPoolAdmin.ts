import { PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";

export async function transferPoolAdmin(
  ctx: Ctx,
  poolId: number,
  newAdmin: PublicKey
) {
  const program = ctx.programs.hydraLiquidityPools;

  const poolState = await KeyFinder.fromCtx(ctx, poolId).poolState();
  const accounts = {
    admin: ctx.provider.wallet.publicKey,
    poolState,
  };

  console.log({
    newAdmin,
    ...accounts,
  });

  const instruction = program.methods
    .transferPoolAdmin(newAdmin)
    .accounts(accounts);

  return instruction;
}
