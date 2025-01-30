import { getMintKeyFromSymbol, InitializeConfig, PoolConfig } from "./libs";
import * as anchor from "@project-serum/anchor";
import { getAsset, HydraSDK, Network } from "@hydraprotocol/sdk";
import { TaskRunner } from "./task";
import { PublicKey } from "@solana/web3.js";
import { airdrop } from "@hydraprotocol/utils-solana";
import { createMintAssociatedVaultFromAsset } from "./createMintAssociatedVaultFromAsset";
import { loadKey } from "@hydraprotocol/sdk/node";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import * as SPLToken from "@solana/spl-token";

export async function initialize(
  provider: anchor.AnchorProvider,
  network: Network,
  config: InitializeConfig
) {
  anchor.setProvider(provider);

  // Hydra SDK has the god wallet in it's provider
  const sdk = HydraSDK.fromAnchorProvider(provider, network);

  const runner = TaskRunner.create(
    TaskRunner.STANDARD_LOGGER,
    TaskRunner.QUIT_ON_ERROR
  );

  // Initialize tokens
  const tokens = new Map<string, PublicKey>();

  for (const { symbol, amount } of config.tokens) {
    runner
      // initializing symbol with amount
      .add(`Initializing ${symbol} with ${amount}`, () => {
        if (symbol === "wsol" && network === Network.LOCALNET)
          // return initializeWrappedSolWithAmount(sdk, amount);
          return airdrop(sdk, sdk.ctx.wallet.publicKey, Number(amount));
        else return initializeSymbolWithAmount(sdk, symbol, amount, tokens);
      })
      // unless asset is already initialized
      .unless(() => {
        if (symbol === "wsol" && network === Network.LOCALNET)
          // return solAtaHasEnoughFunds(sdk, amount);
          return accountHasEnoughSOL(
            sdk,
            sdk.ctx.wallet.publicKey.toString(),
            Number(amount)
          );
        else return assetIsInitialized(sdk, symbol);
      });
  }

  runner
    // Initialize global state for this programId
    .add("Initializing global state for programId", () =>
      sdk.liquidityPools.initializeGlobalState()
    )
    // Unless global state is already initialized
    .unless(async () => {
      const isInitialized = await sdk.liquidityPools.accounts
        .globalState()
        .isInitialized();
      console.log(`global state is initialized: ${isInitialized}`);
      return isInitialized;
    });

  for (const [index, pool] of config.pools.entries()) {
    runner
      // Initialize pool with token amounts
      .add(
        `Initialize Pool (${pool.tokenA},${pool.tokenB}) with (${pool.tokenAAmount},${pool.tokenBAmount})`,
        () => initializePool(sdk, pool)
      )
      // Unless pool have been already initialized
      .unless(() => poolIsInitialized(sdk, pool, index));
  }

  runner
    // Get gas money for demo account
    .add("Get gas money for demo account", () =>
      airdropAccount(sdk, config.demoAccount.demoAccountKey, 10 * 1_000_000)
    )
    // Unless account has enough sol
    .unless(() =>
      accountHasEnoughSOL(
        sdk,
        config.demoAccount.demoAccountKey,
        10 * 1_000_000
      )
    );

  for (const { symbol, amount } of config.demoAccount.tokens) {
    runner
      // Transfer tokens to demo account
      .add(`Transfer ${amount} ${symbol} to demo account`, () => {
        if (symbol === "wsol" && network === Network.LOCALNET)
          return airdrop(
            sdk,
            new PublicKey(config.demoAccount.demoAccountKey),
            Number(amount)
          );
        else
          return transferTokensFromPayer(
            sdk,
            config.demoAccount.demoAccountKey,
            tokens,
            symbol,
            amount
          );
      })
      // Unless there is already an associated token account for
      // the token mint and there is enough balance of tokens already
      .unless(async () => {
        if (symbol === "wsol" && network === Network.LOCALNET)
          return accountHasEnoughSOL(
            sdk,
            config.demoAccount.demoAccountKey,
            Number(amount)
          );
        else {
          const mintKey = getMintKeyFromSymbol(symbol, sdk.ctx.network);
          const srcKey = await getAssociatedVault(sdk, mintKey);
          const srcVault = sdk.accountLoaders.token(srcKey);
          const demoKey = new PublicKey(config.demoAccount.demoAccountKey);
          const demoAta = await getAssociatedVault(sdk, mintKey, demoKey);
          const demoAtaLoader = sdk.accountLoaders.token(demoAta);
          if (await demoAtaLoader.isInitialized()) {
            console.log("The ATA has already been initialized");
            return true; // Do not run if the ATA has already been initialized
          }
          const balance = await srcVault.balance();
          const notEnoughBalance = amount > balance;
          notEnoughBalance &&
            console.log(
              `Not enough balance to execute tx: ${amount} > ${balance}`
            );
          return notEnoughBalance;
        }
      });
  }
  const dryRun = !!process.env.DRY_RUN;
  await runner.run(dryRun);
  // Ok so now if you load up the private keys for both god and the
  // demo account in your test wallet, you should be able to play around with the app on localhost:

  // yarn private-key ./keys/users/usrQpqgkvUjPgAVnGm8Dk3HmX3qXr1w4gLJMazLNyiW.json
  // yarn private-key ~/.config/solana/id.json
}

async function getAssociatedVault(
  sdk: HydraSDK,
  mint: PublicKey,
  owner: PublicKey = sdk.ctx.provider.wallet.publicKey
) {
  const vault = await SPLToken.getAssociatedTokenAddress(
    mint, // mint
    owner, // token account authority
    false,
    SPLToken.TOKEN_PROGRAM_ID,
    SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return vault;
}

async function initializeSymbolWithAmount(
  sdk: HydraSDK,
  symbol: string,
  amount: bigint,
  tokens: Map<string, PublicKey>
) {
  const asset = getAsset(symbol, sdk.ctx.network);
  const normalizedSymbol = asset.symbol.toLowerCase();
  const associatedVault = await createMintAssociatedVaultFromAsset(
    sdk,
    asset,
    amount
  );
  console.log(`${normalizedSymbol}:${associatedVault}`);
  tokens.set(normalizedSymbol, associatedVault);
}

export async function initializePool(sdk: HydraSDK, pool: PoolConfig) {
  console.log(`initializePool`, { pool });
  const tokenXKey = getMintKeyFromSymbol(pool.tokenA, sdk.ctx.network);
  const tokenYKey = getMintKeyFromSymbol(pool.tokenB, sdk.ctx.network);

  const tokenXAmount = pool.tokenAAmount;
  const tokenYAmount = pool.tokenBAmount;

  const nextPoolId = await sdk.liquidityPools.accounts.nextPoolId();

  console.log(
    `Initializing pool (${pool.tokenA},${pool.tokenB},${nextPoolId})...`
  );
  await sdk.liquidityPools.initializePoolState(tokenXKey, tokenYKey, pool.fees);
  console.log(`INITIALIZED! (${pool.tokenA},${pool.tokenB},${nextPoolId})...`);
  console.log(
    `Adding liquidity (${pool.tokenA},${pool.tokenB},${nextPoolId}) ...`
  );
  try {
    await sdk.liquidityPools.addLiquidity(
      tokenXKey,
      tokenYKey,
      nextPoolId,
      tokenXAmount,
      tokenYAmount
    );
  } catch (err) {
    console.log({ err });
    throw err;
  }
}

export async function poolIsInitialized(
  sdk: HydraSDK,
  pool: PoolConfig,
  poolId: number
) {
  console.log("Checking if pool is initialized... ", { pool, poolId });
  const tokenXKey = getMintKeyFromSymbol(pool.tokenA, sdk.ctx.network);
  const tokenYKey = getMintKeyFromSymbol(pool.tokenB, sdk.ctx.network);

  console.log("Before loaders....", { tokenXKey, tokenYKey, poolId });
  const loaders = await sdk.liquidityPools.accounts.getAccountLoaders(
    tokenXKey,
    tokenYKey,
    poolId
  );
  console.log("After loaders....");

  const isInitialized = await loaders.poolState.isInitialized();
  console.log(
    `Pool (${pool.tokenA},${pool.tokenB}) is initialized = ${isInitialized}`
  );
  return isInitialized;
}

async function assetIsInitialized(sdk: HydraSDK, symbol: string) {
  const asset = getAsset(symbol, sdk.ctx.network);
  const isInitialized = await sdk.accountLoaders
    .mint(new PublicKey(asset.address))
    .isInitialized();
  console.log(`assetIsInitialized: ${isInitialized}`);

  return isInitialized;
}

export async function airdropAccount(
  sdk: HydraSDK,
  pubKey: string,
  amount: number
) {
  console.log(`airdropAccount: keys/users/${pubKey}.json`);
  const demoAccount = await loadKey(`keys/users/${pubKey}.json`);
  console.log(`got account: ${pubKey}`);
  console.log(`Airdropping ${amount} SOL ...`);
  await airdrop(sdk, demoAccount.publicKey, amount);
}

export async function transferTokensFromPayer(
  sdk: HydraSDK,
  to: string,
  srcAccounts: Map<string, PublicKey>,
  symbol: string,
  amount: bigint
) {
  console.log({
    to,
    srcAccounts: Array.from(srcAccounts).map(([k, v]) => `${k}:${v}`),
    symbol,
    amount,
  });
  const payer = (sdk.ctx.provider.wallet as any as NodeWallet).payer;
  const demoAccount = await loadKey(`keys/users/${to}.json`);
  const mintKey = getMintKeyFromSymbol(symbol, sdk.ctx.network);
  const srcKey = await getAssociatedVault(sdk, mintKey);

  if (!srcKey)
    throw new Error(
      `Cannot determine associated vault key from symbol ${symbol}`
    );
  console.log(
    `Creating associated account for mint: "${mintKey}" with account: "${demoAccount.publicKey}" and payer "${payer.publicKey}"`
  );

  const demoAccountAta = await sdk.common.createAssociatedAccount(
    mintKey,
    demoAccount,
    payer
  );

  console.log(`Transferring amount: "${amount}"`);

  await sdk.common.transfer(srcKey, demoAccountAta, amount);
}

export async function accountHasEnoughSOL(
  sdk: HydraSDK,
  pubKey: string,
  howMuch: number
) {
  console.log(`Checking account sol: ${pubKey} ${howMuch}`);
  const info = await sdk.ctx.provider.connection.getAccountInfo(
    new PublicKey(pubKey)
  );
  console.log({ info });
  return info ? info.lamports > howMuch : false;
}
