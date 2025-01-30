import { Ctx } from "../..";
import * as anchor from "@project-serum/anchor";
import * as accs from "../accounts";
import { inject } from "../../utils/meta-utils";
import { TOKEN_PROGRAM_ID } from "@project-serum/serum/lib/token-instructions";
import { PublicKey } from "@solana/web3.js";
import { PoolFees } from "../types";
import { isEqual, toBN } from "../../utils";

type AnchorPoolFees = {
  feeCalculation: string;
  feeLastUpdate: anchor.BN;
  feeLastPrice: anchor.BN;
  feeEwmaWindow: anchor.BN;
  feeLastEwma: anchor.BN;
  feeLambda: anchor.BN;
  feeVelocity: anchor.BN;
  feeMinPct: anchor.BN;
  feeMaxPct: anchor.BN;
};

function toAnchorPoolFees(fees: PoolFees): AnchorPoolFees {
  return {
    feeCalculation: fees.feeCalculation,
    feeLastUpdate: toBN(fees.feeLastUpdate),
    feeLastPrice: toBN(fees.feeLastPrice),
    feeEwmaWindow: toBN(fees.feeEwmaWindow),
    feeLastEwma: toBN(fees.feeLastEwma),
    feeLambda: toBN(fees.feeLambda),
    feeVelocity: toBN(fees.feeVelocity),
    feeMinPct: toBN(fees.feeMinPct),
    feeMaxPct: toBN(fees.feeMaxPct),
  };
}

export async function initializePoolState(
  ctx: Ctx,
  tokenXMint: PublicKey,
  tokenYMint: PublicKey,
  poolFees: PoolFees,
  cValue: number = 0,
  priceAccountX?: PublicKey,
  priceAccountY?: PublicKey
) {
  const program = ctx.programs.hydraLiquidityPools;
  const injectedAccounts = inject(accs, ctx);
  const globalStateLoader = injectedAccounts.globalState();
  const globalStateInfo = await globalStateLoader.info();
  const poolCount = globalStateInfo.data.poolCount;
  const pdas = await injectedAccounts.getAccountLoaders(
    tokenXMint,
    tokenYMint,
    poolCount
  );
  const tokenXVaultBump = await pdas.tokenXVault.bump();
  const tokenYVaultBump = await pdas.tokenYVault.bump();
  const poolStateBump = await pdas.poolState.bump();
  const lpTokenVaultBump = await pdas.lpTokenVault.bump();
  const lpTokenMintBump = await pdas.lpTokenMint.bump();
  const lpTokenMint = await pdas.lpTokenMint.key();
  const tokenXVault = await pdas.tokenXVault.key();
  const tokenYVault = await pdas.tokenYVault.key();
  const lpTokenVault = await pdas.lpTokenVault.key();
  const globalState = await pdas.globalState.key();
  const poolState = await pdas.poolState.key();

  const accounts = {
    admin: ctx.provider.wallet.publicKey,
    globalState,
    poolState,
    tokenXMint,
    tokenYMint,
    lpTokenMint,
    tokenXVault,
    tokenYVault,
    lpTokenVault,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  };

  ctx.log({
    tokenXVaultBump,
    tokenYVaultBump,
    poolStateBump,
    lpTokenVaultBump,
    lpTokenMintBump,
    cValue,
    poolFees,
    ...accounts,
    priceAccountX,
    priceAccountY,
  });

  const initializeBase = program.methods
    .initializePoolState(
      tokenXVaultBump,
      tokenYVaultBump,
      poolStateBump,
      lpTokenVaultBump,
      lpTokenMintBump,
      cValue,
      toAnchorPoolFees(poolFees)
    )
    .accounts(accounts);

  const instruction =
    priceAccountX &&
    priceAccountY &&
    !isEqual(priceAccountX, PublicKey.default) &&
    !isEqual(priceAccountY, PublicKey.default)
      ? initializeBase.remainingAccounts([
          { pubkey: priceAccountX, isSigner: false, isWritable: false },
          { pubkey: priceAccountY, isSigner: false, isWritable: false },
        ])
      : initializeBase;

  return instruction;
}
