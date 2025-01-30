import { PublicKey } from "@solana/web3.js";
import { createSDK, ensurePublicKey, proposeMultisigTx } from "./utils";
import { RemoveLiquidityArgs } from "../cmds/liquidity-pools/remove-liquidity";

export async function removeLiquidity({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  lpTokensToBurn,
}: RemoveLiquidityArgs) {
  const sdk = createSDK(network, walletLocation);

  return await sdk.liquidityPools.removeLiquidity(
    new PublicKey(tokenXMint),
    new PublicKey(tokenYMint),
    poolId,
    BigInt(lpTokensToBurn)
  );
}

export async function removeLiquidityMultisig({
  network,
  walletLocation,
  tokenXMint,
  tokenYMint,
  poolId,
  lpTokensToBurn,
  multisigSafe,
  multisigActor,
}: RemoveLiquidityArgs) {
  const sdk = createSDK(network, walletLocation);

  const tx = await sdk
    .as(multisigActor)
    .liquidityPools.removeLiquidityTx(
      new PublicKey(tokenXMint),
      new PublicKey(tokenYMint),
      poolId,
      BigInt(lpTokensToBurn)
    );

  return await proposeMultisigTx(
    "removeLiquidity",
    sdk,
    tx,
    ensurePublicKey(multisigSafe)
  );
}
