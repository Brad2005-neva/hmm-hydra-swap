[← 🏠](./CONTRIBUTING.md)

# Regenerating tokens and deploying to devnet

## TLDR;

Basic steps to regenerating accounts from scratch on devnet

1. `yarn wallet /path/to/deployer.json`
1. `yarn regenerate-program-ids` which will update `global-config.json` and all programs with fresh keys
1. `yarn deploy devnet`
1. `./scripts/setup-tokens.sh devnet` which will update `tokens.json`
1. \[TO BE AUTOMATED\] Set the prices at the top of the `./scripts/setup-pools.sh` script from [here](`https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]`)
1. `./scripts/setup-pools.sh devnet`

## In more detail

- Ensure you are logged in under the devnet treasury account: `yarn wallet /path/to/the/wallet`

  - This will be the account that creates pools for devnet and has mint rights to tokens (we don't want to share this account in our git repo or we may get spammed)
  - To generate a new account you can use `solana-keygen new --no-bip39-passphrase --force`

- Regenerate your tokens and programids: `yarn regenerate-program-ids`

This will create new keys within `keys/programs/*`

- Airdrop some tokens ensuring you are connected to the devnet cluster

  - `solana config set --url devnet`

  Air drop funds to your wallet

  - `solana airdrop 2`
  - `solana airdrop 2`
  - `solana airdrop 2`
  - `solana airdrop 2`
  - `solana airdrop 2`
  - `solana airdrop 2`
  - Yes you may need to do this a few times until you have a balance of 12 or so SOL.

- Deploy your programs to their new addresses: `yarn deploy devnet`

  - NOTE: occasionally this fails if it does:
    - `solana-keygen recover -o mybrokendeploy.json`
    - `solana program deploy --buffer mybrokendeploy.json target/deploy/hydra_liquidity_pools.so`
    - If you get `Error: Deploying program failed: Error processing Instruction 1: custom program error: 0x1` it mean you are out of SOL and need to top up
    - Top up with `solana airdrop 2` until you have like 8 SOL and try again with `solana program deploy --buffer mybrokendeploy.json target/deploy/hydra_liquidity_pools.so`

- You can initialize pools manually or using the following script:
  - `./scripts/setup-pools.sh devnet`
