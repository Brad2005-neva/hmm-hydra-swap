import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";

export async function setCValue(
  ctx: Ctx,
  poolId: number,
  compensation: number
) {
  const program = ctx.programs.hydraLiquidityPools;

  const poolState = await KeyFinder.fromCtx(ctx, poolId).poolState();

  const accounts = {
    admin: ctx.provider.wallet.publicKey,
    poolState,
  };

  ctx.log(accounts);

  return program.methods.setCValue(compensation).accounts(accounts);
}
