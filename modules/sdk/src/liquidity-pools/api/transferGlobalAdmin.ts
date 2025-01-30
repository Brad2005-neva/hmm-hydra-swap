import { PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { KeyFinder } from "../KeyFinder";

export async function transferGlobalAdmin(ctx: Ctx, newAdmin: PublicKey) {
  const program = ctx.programs.hydraLiquidityPools;

  const globalState = await KeyFinder.fromCtx(ctx).globalState();
  const accounts = {
    admin: ctx.provider.wallet.publicKey,
    globalState,
  };

  console.log({
    newAdmin,
    ...accounts,
  });

  const instruction = program.methods
    .transferGlobalAdmin(newAdmin)
    .accounts(accounts);

  return instruction;
}
