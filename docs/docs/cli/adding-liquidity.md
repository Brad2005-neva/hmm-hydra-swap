# Adding Liquidity

Add liquidity to the pool

```
$ hydra lp add-liquidity \
  --poolId 0 \
  --tokenXMint btcYG7B3pxLufZ2anawRN3Zmhrr7mnnudTEepEinGus \
  --tokenYMint usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f \
  --tokenXAmount 100000000000 \
  --tokenYAmount 45166800000000
```

```

Add Liquidity

Options:
  --help            Show help                                          [boolean]
  --version         Show version number                                [boolean]
  --network         The network to connect to
             [string] [choices: "devnet", "localnet", "mainnet-beta", "testnet",
                                       "fake-mainnet"] [default: "mainnet-beta"]
  --walletLocation  The location of your filesystem wallet
                                  [string] [default: "~/.config/solana/id.json"]
  --multisigSafe    An address of a multisig safe. When specified the command
                    will propose a multisig transaction instead of sending the
                    transaction directly to the chain.                  [string]
  --multisigActor   An address of the multisig actor inside the multisig safe.
                    This will be the account that will be the actor for the
                    transaction.                                        [string]
  --tokenXMint      Token X Mint address                     [string] [required]
  --tokenYMint      Token Y Mint address                     [string] [required]
  --poolId          The pool index id                        [number] [required]
  --tokenXAmount    The amount of token X you wish to add to the pool in
                    non-divisable units                      [number] [required]
  --tokenYAmount    The amount of token Y you wish to add to the pool in
                    non-divisable units                      [number] [required]
  --slippage
```
