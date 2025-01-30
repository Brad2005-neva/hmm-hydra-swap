import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";
import { Limits } from "../types";
import { toBN } from "../../utils";
import * as anchor from "@project-serum/anchor";

export async function setLimits(ctx: Ctx, poolId: number, limits: Limits) {
  const program = ctx.programs.hydraLiquidityPools;

  const poolState = await KeyFinder.fromCtx(ctx, poolId).poolState();

  const accounts = {
    payer: ctx.provider.wallet.publicKey,
    poolState,
  };

  ctx.log(accounts);

  type AnchorLimits = {
    enabled: boolean;
    liquidityTokenXMax: anchor.BN;
    liquidityTokenYMax: anchor.BN;
    swapTokenXMax: anchor.BN;
    swapTokenYMax: anchor.BN;
  };

  function toAnchorLimits(limits: Limits): AnchorLimits {
    return {
      enabled: limits.enabled,
      liquidityTokenXMax: toBN(limits.liquidityTokenXMax),
      liquidityTokenYMax: toBN(limits.liquidityTokenYMax),
      swapTokenXMax: toBN(limits.swapTokenXMax),
      swapTokenYMax: toBN(limits.swapTokenYMax),
    };
  }

  return program.methods.setLimits(toAnchorLimits(limits)).accounts(accounts);
}
