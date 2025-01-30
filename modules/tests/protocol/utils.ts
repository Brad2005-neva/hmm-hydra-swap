import { Provider } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import { resolve } from "path";
import { HydraSDK, parseJsonFees } from "@hydraprotocol/sdk";
import token from "@hydraprotocol/config/tokens.json";
import feeDefaults from "@hydraprotocol/config/fee_defaults.json";

export type TokenInfo = {
  symbol: string;
  pubkey: PublicKey;
  decimal: number;
  keypair: Keypair;
};

export function orderKeyPairs(a: Keypair, b: Keypair) {
  if (a.publicKey.toBuffer().compare(b.publicKey.toBuffer()) > 0) {
    return [b, a];
  }
  return [a, b];
}

export async function prepareTestPoolInfo(
  poolId: number,
  xMintAmount: bigint,
  xMintDecimals: number,
  yMintAmount: bigint,
  yMintDecimals: number,
  sdk: HydraSDK,
  tokenXMintKeypair?: Keypair,
  tokenYMintKeypair?: Keypair
) {
  // Keys will be ordered based on base58 encoding
  const [xMintPair, yMintPair] = orderKeyPairs(
    tokenXMintKeypair ?? Keypair.generate(),
    tokenYMintKeypair ?? Keypair.generate()
  );

  const accounts = await sdk.liquidityPools.accounts.getAccountLoaders(
    xMintPair.publicKey,
    yMintPair.publicKey,
    poolId
  );

  const [xMint, xAccount] = await sdk.common.createMintAndAssociatedVault(
    xMintPair,
    xMintAmount,
    sdk.ctx.provider.wallet.publicKey,
    xMintDecimals
  );

  const [yMint, yAccount] = await sdk.common.createMintAndAssociatedVault(
    yMintPair,
    yMintAmount,
    sdk.ctx.provider.wallet.publicKey,
    yMintDecimals
  );

  // get the PDA for the PoolState
  const tokenXVault = await accounts.tokenXVault.key();
  const tokenXVaultBump = await accounts.tokenXVault.bump();
  const tokenYVault = await accounts.tokenYVault.key();
  const tokenYVaultBump = await accounts.tokenYVault.bump();
  const poolState = await accounts.poolState.key();
  const poolFees = { ...parseJsonFees(feeDefaults), feeMinPct: 2000000000n };

  return {
    xMintPair,
    yMintPair,
    xMint,
    yMint,
    xAccount,
    yAccount,
    poolState,
    tokenXVault,
    tokenXVaultBump,
    tokenYVault,
    tokenYVaultBump,
    poolFees,
  };
}

export async function createNewTester(provider: Provider) {
  const wallet = Keypair.generate();

  // Configure the client to use the local cluster.
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(wallet.publicKey, 10000000000),
    "confirmed"
  );
  return wallet;
}

export async function loadTokensInfoAndKeypair() {
  const tokenInfo: TokenInfo[] = [];

  token.localnet.forEach((info) => {
    if (info.symbol === "wSOL") return;

    const filepath = resolve(
      __dirname,
      `../../../keys/tokens/${info.address}.json`
    );
    if (!fs.existsSync(filepath)) {
      throw new Error(`could not find token keypair file: ${info.address}`);
    }

    const sk = JSON.parse(fs.readFileSync(filepath).toString());
    const keypair = Keypair.fromSecretKey(new Uint8Array(sk));

    tokenInfo.push({
      symbol: info.symbol,
      pubkey: new PublicKey(info.address),
      decimal: info.decimals,
      keypair,
    });
  });

  console.log(`${tokenInfo.length} tokens successfully loaded`);
  return tokenInfo;
}

export function getTokenInfoBySymbol(tokens: TokenInfo[], symbol: string) {
  const infos = tokens.filter((info) => info.symbol == symbol);
  if (infos.length == 0) return undefined;
  return infos[0];
}

export const INIT_TOKEN_INFO = [
  {
    symbol: "USDC",
    pubkey: PublicKey.default,
    decimal: 6,
    keypair: Keypair.generate(),
  },
  {
    symbol: "wBTC",
    pubkey: PublicKey.default,
    decimal: 8,
    keypair: Keypair.generate(),
  },
  {
    symbol: "wETH",
    pubkey: PublicKey.default,
    decimal: 9,
    keypair: Keypair.generate(),
  },
];
