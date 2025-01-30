import { PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";

export async function setPricesOwner(ctx: Ctx, newOwner: PublicKey) {
  const program = ctx.programs.hydraLiquidityPools;

  const globalState = await KeyFinder.fromCtx(ctx).globalState();
  const accounts = {
    payer: ctx.provider.wallet.publicKey,
    globalState,
  };

  ctx.log(accounts);

  return program.methods.setPricesOwner(newOwner).accounts(accounts);
}
