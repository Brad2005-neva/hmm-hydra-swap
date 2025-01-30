import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";
import { FeatureType } from "../types";

export async function setFeature(
  ctx: Ctx,
  featureType: FeatureType,
  value: boolean
) {
  const program = ctx.programs.hydraLiquidityPools;

  const globalState = await KeyFinder.fromCtx(ctx).globalState();

  const accounts = {
    payer: ctx.provider.wallet.publicKey,
    globalState,
  };

  ctx.log(accounts);

  let type = {};
  switch (featureType) {
    case FeatureType.Swap:
      type = { swap: {} };
      break;
    case FeatureType.AddLiquidity:
      type = { addLiquidity: {} };
      break;
    case FeatureType.RemoveLiquidity:
      type = { removeLiquidity: {} };
      break;
    case FeatureType.CreatePublicPools:
      type = { createPublicPools: {} };
      break;
    case FeatureType.All:
      type = { all: {} };
      break;
  }

  return program.methods.setFeature(type, value).accounts(accounts);
}
