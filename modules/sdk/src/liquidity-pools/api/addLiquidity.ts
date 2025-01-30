import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { AnchorBuilderMethod, Ctx } from "../../types";
import * as accs from "../accounts";
import { toBN } from "../../utils";
import { inject } from "../../utils/meta-utils";
import { SystemProgram } from "@solana/web3.js";
import * as SPLToken from "@solana/spl-token";
import { web3 } from "@project-serum/anchor";
import { tryGetInitializedAccount, unwrap, wrap } from "../wrap";

export async function addLiquidity(
  ctx: Ctx,
  tokenXMint: PublicKey,
  tokenYMint: PublicKey,
  poolId: number,
  tokenXAmount: bigint,
  tokenYAmount: bigint,
  slippage: bigint = 0n
): Promise<AnchorBuilderMethod> {
  const program = ctx.programs.hydraLiquidityPools;

  const {
    tokenXVault,
    tokenYVault,
    lpTokenVault,
    userTokenX,
    userTokenY,
    lpTokenMint,
    lpTokenAssociatedAccount,
    poolState,
    globalState,
  } = await inject(accs, ctx).getAccountLoaders(tokenXMint, tokenYMint, poolId);

  const isInitialized = await poolState.isInitialized();

  if (!isInitialized)
    throw new Error("Pool is not initialized! Try calling initialize first.");

  // Calculate slippage max amount
  const tokenXAmountMax = (tokenXAmount * (10_000n + slippage)) / 10_000n;
  const tokenYAmountMax = (tokenYAmount * (10_000n + slippage)) / 10_000n;

  const accounts = {
    tokenXMint,
    tokenYMint,
    globalState: await globalState.key(),
    poolState: await poolState.key(),
    lpTokenMint: await lpTokenMint.key(),
    userTokenX: await userTokenX.key(),
    userTokenY: await userTokenY.key(),
    user: ctx.provider.wallet.publicKey,
    tokenXVault: await tokenXVault.key(),
    tokenYVault: await tokenYVault.key(),
    lpTokenVault: await lpTokenVault.key(),
    lpTokenTo: await lpTokenAssociatedAccount.key(),
    systemProgram: SystemProgram.programId,
    tokenProgram: SPLToken.TOKEN_PROGRAM_ID,
    associatedTokenProgram: SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    rent: web3.SYSVAR_RENT_PUBKEY,
  };

  ctx.log({
    poolId,
    tokenXAmount,
    tokenYAmount,
    tokenXAmountMax,
    tokenYAmountMax,
    ...accounts,
  });

  const connection = ctx.connection;
  const userMainAccount = ctx.provider.wallet.publicKey;
  const userNativeAta = await SPLToken.getAssociatedTokenAddress(
    SPLToken.NATIVE_MINT,
    ctx.provider.wallet.publicKey
  );
  const ataDescriptor = await tryGetInitializedAccount(
    connection,
    userNativeAta
  );

  const [tokenSolAmount, solAccTokenY] =
    `${tokenXMint}` === `${SPLToken.NATIVE_MINT}`
      ? [tokenXAmountMax, userTokenX]
      : [tokenYAmountMax, userTokenY];

  const solAccTokenKey = await solAccTokenY.key();

  const initialPreInstructions: TransactionInstruction[] = [];
  const preInstructions =
    `${solAccTokenKey}` === `${userNativeAta}`
      ? wrap(
          tokenSolAmount - ataDescriptor.accountBalance,
          userMainAccount,
          userNativeAta,
          initialPreInstructions,
          !ataDescriptor.isInitialized
        )
      : initialPreInstructions;

  const initialPostInstructions: TransactionInstruction[] = [];
  const postInstructions =
    `${solAccTokenKey}` === `${userNativeAta}`
      ? unwrap(userMainAccount, userNativeAta, initialPostInstructions)
      : initialPostInstructions;

  return program.methods
    .addLiquidity(
      toBN(tokenXAmount),
      toBN(tokenYAmount),
      toBN(tokenXAmountMax),
      toBN(tokenYAmountMax)
    )
    .accounts(accounts)
    .preInstructions(preInstructions)
    .postInstructions(postInstructions);
}
