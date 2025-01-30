[← 🏠](./CONTRIBUTING.md)

# Common Tasks

## Run solana test validator

`yarn val` to run the test validator

`yarn val [snapshot]` to run the test validator with a particular snapshot eg. yarn val e2e will run the test validator with the basic snapshot we use for e2e testing.

`yarn val -d` to run the validator in the background.

`yarn val --log` to run the validator in the background and run solana logs.

See `yarn val --help` for more information

## Run front-end locally

Run the frontend with a validator:

`yarn start`

## Run end to end tests

Run the e2e tests:

`yarn e2e`

## Run unit tests

`yarn test`

## Deploy to a running testnet

`yarn deploy devnet /path/to/deploy/wallet.json`

## Run anchor tests

`yarn anchor-test`

## Migrate

Migration setups up our environment so that our app functions and can be tested.

## Style Guide

We are currently using Storybook.Js as our living style guide.

`cd app`
`yarn storybook`

## Change your wallet to a wallet in the keys folder

```
yarn wallet keys/users/god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D.json
```

## Migrate environment.

```
yarn migrate
```
