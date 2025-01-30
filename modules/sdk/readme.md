# Hydraprotocol Javascript SDK

## Overview

A Javascript SDK for inteacting with Hydra Protocol.

Important links:

- [Github](https://github.com/hydraswap-io/monorepo/tree/devnet/modules/sdk)
- [Documentation](https://docs.hydraswap.io/sdk)
- [Live Application](https://beta.hydraswap.io)

## Disclaimer

This is experimental software all APIs are subject to change.

## Installation

Install via your favourite npm client\*:

```bash
yarn add --dev @hydraprotocol/sdk
```

\* _Coming soon!_

## Basic Usage

```ts
import { HydraSDK, Network } from "@hydraprotocol/sdk";
import { Wallet } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { loadKeypair } from "./helpers";

// Setup configuration
const keypair = loadKeypair("./path/to/keypair");
const wallet = new Wallet(keypair);
const connection = new Connection("https://api.devnet.solana.com");

// Create the client
const hydra = HydraSDK.create(Network.DEVNET, connection, wallet);

// Call a contract method
const txHash = await hydra.liquidityPools.addLiquidity(
  tokenXMint,
  tokenYMint,
  poolId,
  tokenXAmount,
  tokenYAmount,
  slippage
);

console.log(`Your transaction hash: ${txHash}`);
```
