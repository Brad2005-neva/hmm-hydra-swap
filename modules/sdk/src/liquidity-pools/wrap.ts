import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import * as SPLToken from "@solana/spl-token";

export function wrap(
  amount: bigint,
  userMainAccount: PublicKey,
  userNativeAta: PublicKey,
  ixs: TransactionInstruction[],
  doInitialization: boolean = false
) {
  const createIxs = doInitialization
    ? [
        SPLToken.createAssociatedTokenAccountInstruction(
          userMainAccount,
          userNativeAta,
          userMainAccount,
          SPLToken.NATIVE_MINT
        ),
      ]
    : [];

  const wrapIxs =
    amount <= 0n
      ? []
      : [
          SystemProgram.transfer({
            fromPubkey: userMainAccount,
            toPubkey: userNativeAta,
            lamports: Number(amount),
          }),
          SPLToken.createSyncNativeInstruction(userNativeAta),
        ];

  return [...ixs, ...createIxs, ...wrapIxs];
}

export function unwrap(
  userMainAccount: PublicKey,
  userNativeAta: PublicKey,
  ixs: TransactionInstruction[]
) {
  return [
    ...ixs,
    SPLToken.createCloseAccountInstruction(
      userNativeAta,
      userMainAccount,
      userMainAccount
    ),
  ];
}

export async function tryGetInitializedAccount(
  connection: Connection,
  userNativeAta: PublicKey
) {
  try {
    const solAtaAccount = await SPLToken.getAccount(connection, userNativeAta);
    const accountBalance = solAtaAccount.amount ?? 0n;
    return { accountBalance, isInitialized: true };
  } catch (_err) {
    // if error return isInitialized = false below
  }
  return { accountBalance: 0n, isInitialized: false };
}
