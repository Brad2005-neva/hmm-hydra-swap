import { Keypair, PublicKey } from "@solana/web3.js";

export const LIQUIDITY_MINIMUM = 1000n;
export const INIT_TOKEN_INFO = [
  {
    symbol: "USDC",
    pubkey: PublicKey.default,
    decimals: 6,
    keypair: Keypair.generate(),
    initialAmount: 1_000_000n * 10n ** 6n,
  },
  {
    symbol: "wSOL",
    pubkey: PublicKey.default,
    decimals: 9,
    keypair: Keypair.generate(),
    initialAmount: 30_000n * 10n ** 9n,
  },
  {
    symbol: "wBTC",
    pubkey: PublicKey.default,
    decimals: 8,
    keypair: Keypair.generate(),
    initialAmount: 50n * 10n ** 8n,
  },
  {
    symbol: "wETH",
    pubkey: PublicKey.default,
    decimals: 9,
    keypair: Keypair.generate(),
    initialAmount: 450n * 10n ** 9n,
  },
];
