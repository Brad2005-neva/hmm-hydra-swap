import * as anchor from "@project-serum/anchor";
import * as SPLToken from "@solana/spl-token";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Keypair, PublicKey } from "@solana/web3.js";
import { HydraSDK, Token, parseJsonFees } from "@hydraprotocol/sdk";
import Tokens from "@hydraprotocol/config/tokens.json";
import { loadKey } from "@hydraprotocol/sdk/node";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";

/**
 * Get the deployers wallet that has been injected with SOLANA_DEPLOY_KEY
 * During CI we pass in the key using env vars
 */
export function getDeployerWallet() {
  return process.env.SOLANA_DEPLOY_KEY
    ? new NodeWallet(
        Keypair.fromSecretKey(
          Buffer.from(JSON.parse(process.env.SOLANA_DEPLOY_KEY))
        )
      )
    : // use the standard key location
      NodeWallet.local();
}

export function createProvider(
  connection: anchor.web3.Connection,
  wallet: NodeWallet,
  preflightCommitment: anchor.web3.Commitment
) {
  return new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment,
    commitment: "confirmed",
    maxRetries: 10,
  });
}

export async function createNewClientProvider(
  sdk: HydraSDK,
  connection: anchor.web3.Connection
) {
  const newUserWallet = Keypair.generate();
  const wallet = new NodeWallet(newUserWallet);
  await airdrop(sdk, wallet.publicKey, 10000000000);

  const clientProvider = new anchor.AnchorProvider(connection, wallet, {
    skipPreflight: true,
    commitment: "confirmed",
  });

  return clientProvider;
}

export async function airdrop(
  sdk: HydraSDK,
  publicKey: PublicKey,
  lamports: number
) {
  const airdropSignature = await sdk.ctx.connection.requestAirdrop(
    publicKey,
    lamports
  );
  const latestBlockHash = await sdk.ctx.connection.getLatestBlockhash();

  await sdk.ctx.connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    },
    "confirmed"
  );
}

export async function initializeSymbolWithAmount(
  sdk: HydraSDK,
  symbol: string,
  amount: bigint
) {
  console.log(`Initializing ${symbol}: ${amount}`);

  const symbolAsset = Tokens["localnet"].find(
    (asset: Token) => asset.symbol.toLowerCase() === symbol.toLowerCase()
  );
  const symbolAssetAddress = symbolAsset?.address;
  const keypair = await loadKey(`keys/tokens/${symbolAssetAddress}.json`);
  await sdk.common.createMintAndAssociatedVault(
    keypair,
    amount,
    sdk.ctx.provider.wallet.publicKey,
    6
  );
}

export async function initializePool(
  sdk: HydraSDK,
  tokenASymbol: string,
  tokenBSymbol: string
) {
  const fees = {
    ...parseJsonFees(feeDefaults),
    feeMinPct: 2000000000n,
  };

  const tokenAAsset = Tokens["localnet"].find(
    (asset: Token) => asset.symbol.toLowerCase() === tokenASymbol.toLowerCase()
  );
  const tokenBAsset = Tokens["localnet"].find(
    (asset: Token) => asset.symbol.toLowerCase() === tokenBSymbol.toLowerCase()
  );

  if (!tokenAAsset || !tokenBAsset) {
    console.log("Asset not found");
    return;
  }

  const tokenXKey = new PublicKey(tokenAAsset.address);
  const tokenYKey = new PublicKey(tokenBAsset.address);

  console.log(`Initializing pool (${tokenASymbol}, ${tokenBSymbol})...`);
  await sdk.liquidityPools.initializePoolState(tokenXKey, tokenYKey, fees);
}

export async function transferFromPayer(
  sdk: HydraSDK,
  to: Keypair,
  symbol: string,
  amount: bigint
) {
  console.log(`Transfer ${symbol} to DemoAccount: ${amount}`);

  const payer = (sdk.ctx.provider.wallet as any).payer;
  const symbolAsset = Tokens["localnet"].find(
    (asset: Token) => asset.symbol.toLowerCase() === symbol.toLowerCase()
  );

  if (!symbolAsset) {
    console.log("Asset not found");
    return;
  }

  const mintKey = new PublicKey(symbolAsset.address);
  const srcKey = await SPLToken.getAssociatedTokenAddress(
    mintKey,
    payer.publicKey,
    false,
    SPLToken.TOKEN_PROGRAM_ID,
    SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const demoAccountAta = await sdk.common.createAssociatedAccount(
    mintKey,
    to,
    payer
  );
  await sdk.common.transfer(srcKey, demoAccountAta, amount);
}
