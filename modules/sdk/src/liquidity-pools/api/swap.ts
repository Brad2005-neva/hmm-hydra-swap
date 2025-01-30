import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Ctx } from "../../types";
import * as acct from "../accounts";
import { toBN } from "../../utils";
import { inject } from "../../utils/meta-utils";
import { isEqual } from "../../utils";
import { web3 } from "@project-serum/anchor";
import * as SPLToken from "@solana/spl-token";
import { tryGetInitializedAccount, wrap, unwrap } from "../wrap";

export async function swap(
  ctx: Ctx,
  tokenXMint: PublicKey,
  tokenYMint: PublicKey,
  poolId: number,
  userFromToken: PublicKey,
  userToToken: PublicKey,
  amountIn: bigint,
  minimumAmountOut: bigint
) {
  const program = ctx.programs.hydraLiquidityPools;

  const {
    tokenXVault,
    tokenYVault,
    poolState,
    globalState,
    lpTokenMint,
    userTokenX,
  } = await inject(acct, ctx).getAccountLoaders(tokenXMint, tokenYMint, poolId);

  const userToMint =
    `${userToToken}` === `${await userTokenX.key()}` ? tokenXMint : tokenYMint;

  const poolStateInfo = await poolState.info();
  const { priceAccountX, priceAccountY } = poolStateInfo.data.prices;

  const accounts = {
    user: ctx.provider.wallet.publicKey,
    tokenXMint,
    tokenYMint,
    globalState: await globalState.key(),
    poolState: await poolState.key(),
    lpTokenMint: await lpTokenMint.key(),
    userFromToken,
    userToToken,
    userToMint,
    tokenXVault: await tokenXVault.key(),
    tokenYVault: await tokenYVault.key(),
    systemProgram: SystemProgram.programId,
    tokenProgram: SPLToken.TOKEN_PROGRAM_ID,
    associatedTokenProgram: SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    rent: web3.SYSVAR_RENT_PUBKEY,
  };

  ctx.log({
    poolId,
    amountIn,
    minimumAmountOut,
    ...accounts,
    priceAccountX,
    priceAccountY,
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

  const initialPreInstructions = [
    ComputeBudgetProgram.requestUnits({
      units: 400000,
      additionalFee: 0,
    }),
  ];

  const preInstructions =
    `${userFromToken}` === `${userNativeAta}`
      ? wrap(
          amountIn - ataDescriptor.accountBalance,
          userMainAccount,
          userNativeAta,
          initialPreInstructions,
          !ataDescriptor.isInitialized
        )
      : initialPreInstructions;

  const initialPostInstructions: TransactionInstruction[] = [];
  const postInstructions =
    `${userToToken}` === `${userNativeAta}`
      ? unwrap(userMainAccount, userNativeAta, initialPostInstructions)
      : initialPostInstructions;

  const swapBase = program.methods
    .swap(toBN(amountIn), toBN(minimumAmountOut))
    .preInstructions(preInstructions)
    .postInstructions(postInstructions)
    .accounts(accounts);

  const instruction =
    !isEqual(priceAccountX, PublicKey.default) &&
    !isEqual(priceAccountY, PublicKey.default)
      ? swapBase.remainingAccounts([
          { pubkey: priceAccountX, isSigner: false, isWritable: false },
          { pubkey: priceAccountY, isSigner: false, isWritable: false },
        ])
      : swapBase;

  return instruction;
}
