import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ctx } from "../../types";
import * as accs from "../accounts";
import { toBN } from "../../utils";
import { inject } from "../../utils/meta-utils";
import { SystemProgram } from "@solana/web3.js";
import * as SPLToken from "@solana/spl-token";
import { web3 } from "@project-serum/anchor";
import { unwrap } from "../wrap";

export async function removeLiquidity(
  ctx: Ctx,
  tokenXMint: PublicKey,
  tokenYMint: PublicKey,
  poolId: number,
  lpTokensToBurn: bigint
) {
  const program = ctx.programs.hydraLiquidityPools;
  const {
    tokenXVault,
    tokenYVault,
    userTokenX,
    userTokenY,
    lpTokenAssociatedAccount,
    poolState,
    globalState,
    lpTokenMint,
    lpTokenVault,
  } = await inject(accs, ctx).getAccountLoaders(tokenXMint, tokenYMint, poolId);

  const accounts = {
    globalState: await globalState.key(),
    poolState: await poolState.key(),
    lpTokenMint: await lpTokenMint.key(),
    userTokenX: await userTokenX.key(),
    userTokenY: await userTokenY.key(),
    user: ctx.provider.wallet.publicKey,
    tokenXVault: await tokenXVault.key(),
    tokenYVault: await tokenYVault.key(),
    tokenXMint,
    tokenYMint,
    lpTokenFrom: await lpTokenAssociatedAccount.key(),
    lpTokenVault: await lpTokenVault.key(),
    systemProgram: SystemProgram.programId,
    tokenProgram: SPLToken.TOKEN_PROGRAM_ID,
    associatedTokenProgram: SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    rent: web3.SYSVAR_RENT_PUBKEY,
  };

  ctx.log({
    poolId,
    lpTokensToBurn,
    ...accounts,
  });

  const userMainAccount = ctx.provider.wallet.publicKey;
  const userNativeAta = await SPLToken.getAssociatedTokenAddress(
    SPLToken.NATIVE_MINT,
    ctx.provider.wallet.publicKey
  );

  const initialPostInstructions: TransactionInstruction[] = [];
  const postInstructions =
    `${tokenXMint}` === `${SPLToken.NATIVE_MINT}` ||
    `${tokenYMint}` === `${SPLToken.NATIVE_MINT}`
      ? unwrap(userMainAccount, userNativeAta, initialPostInstructions)
      : initialPostInstructions;

  return program.methods
    .removeLiquidity(toBN(lpTokensToBurn))
    .postInstructions(postInstructions)
    .accounts(accounts);
}
