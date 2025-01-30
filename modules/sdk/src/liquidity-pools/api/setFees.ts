import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";
import { OptionalPoolFees } from "../types";
import { toBN } from "../../utils";

export async function setFees(
  ctx: Ctx,
  poolId: number,
  fees: OptionalPoolFees
) {
  const program = ctx.programs.hydraLiquidityPools;

  const poolState = await KeyFinder.fromCtx(ctx, poolId).poolState();

  const accounts = {
    payer: ctx.provider.wallet.publicKey,
    poolState,
  };

  ctx.log(accounts);

  return program.methods
    .setFees(
      fees.feeCalculation as string,
      fees.feeMinPct ? toBN(fees.feeMinPct) : null,
      fees.feeMaxPct ? toBN(fees.feeMaxPct) : null,
      fees.feeEwmaWindow ? toBN(fees.feeEwmaWindow) : null,
      fees.feeLastEwma ? toBN(fees.feeLastEwma) : null,
      fees.feeLambda ? toBN(fees.feeLambda) : null,
      fees.feeVelocity ? toBN(fees.feeVelocity) : null
    )
    .accounts(accounts);
}
