import * as anchor from "@project-serum/anchor";
import { HydraFaucetSDK, Network } from "@hydraprotocol/sdk";
import { TaskRunner } from "./task";
import { PublicKey, Keypair } from "@solana/web3.js";

const INIT_TOKEN_INFO = [
  {
    symbol: "USDC",
    pubkey: PublicKey.default,
    decimal: 6,
  },
  {
    symbol: "wBTC",
    pubkey: PublicKey.default,
    decimal: 8,
  },
  {
    symbol: "wETH",
    pubkey: PublicKey.default,
    decimal: 9,
  },
  {
    symbol: "wSOL",
    pubkey: PublicKey.default,
    decimal: 9,
  },
];

export async function initializeFaucet(
  provider: anchor.AnchorProvider,
  network: Network
) {
  anchor.setProvider(provider);

  // Hydra SDK has the god wallet in it's provider
  const sdk = HydraFaucetSDK.fromAnchorProvider(provider, network);

  const runner = TaskRunner.create(
    TaskRunner.STANDARD_LOGGER,
    TaskRunner.QUIT_ON_ERROR
  );

  // Initialize tokens
  const tokens = INIT_TOKEN_INFO;

  for (const idx in tokens) {
    runner
      // initializing token faucet
      .add(
        `Initializing ${tokens[idx].symbol} with ${tokens[idx].decimal} decimal`,
        async () => {
          const tokenKeypair = Keypair.generate();
          const pubkey = tokenKeypair.publicKey;
          await sdk.methods.initFaucet(tokens[idx].decimal, tokenKeypair);
          tokens[idx].pubkey = pubkey;
          console.log(`Token faucet is created`, {
            ...tokens[idx],
            pubkey: tokens[idx].pubkey.toBase58(),
          });
        }
      )
      // unless asset is already initialized
      .unless(() => assetIsInitialized(sdk, tokens[idx].pubkey));
  }

  const dryRun = !!process.env.DRY_RUN;
  await runner.run(dryRun);
}

async function assetIsInitialized(sdk: HydraFaucetSDK, pubkey: PublicKey) {
  let isInitialized = false;
  try {
    if ((await (await sdk.accounts.faucetState(pubkey)).data()) != null)
      isInitialized = true;
  } catch (err) {
    console.error(err);
  }
  console.log(`assetIsInitialized: ${isInitialized}`);
  return isInitialized;
}
