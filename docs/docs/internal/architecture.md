[← 🏠](./CONTRIBUTING.md)

## Architecture

Key pieces of our monorepo

### Solana / Rust

| Package                            | Name                  | Description                                  | Deployment target |
| ---------------------------------- | --------------------- | -------------------------------------------- | ----------------- |
| `/modules/core`                    | `@hydraprotocol/core` | Our solana contract code written with anchor | solana cluster    |
| `/modules/core/modules/hydra-math` | `@hydraprotocol/math` | Hydra Protocol algorhythmic functions        | solana cluster    |
| `/modules/idls`                    | `@hydraprotocol/idls` | IDLs created by buliding core                | json              |

### Frontend/Isomorphic

| Package                | Name                         | Description                                        | Deployment target |
| ---------------------- | ---------------------------- | -------------------------------------------------- | ----------------- |
| `/app`                 | `@hydraprotocol/app`         | Frontend view application                          | browser           |
| `/modules/services`    | `@hydraprotocol/services`    | Stateful app logic in rxjs with adaptors for react | browser           |
| `/modules/sdk`         | `@hydraprotocol/sdk`         | Stateless app logic                                | node / browser    |
| `/modules/config`      | `@hydraprotocol/config`      | Typescript/Monorepo config                         | node / browser    |
| `/modules/wasm-loader` | `@hydraprotocol/wasm-loader` | Module to load wasm on the frontend                | browser           |

### Cli

| Package        | Name                 | Description                                                             | Deployment target |
| -------------- | -------------------- | ----------------------------------------------------------------------- | ----------------- |
| `/modules/cli` | `@hydraprotocol/cli` | CLI for our sdk                                                         | node cli          |
| `/modules/val` | `@hydraprotocol/val` | Wrapper around solana-test-validator to hook into our testing structure | node cli          |

### Testing

| Package          | Name                   | Description               | Deployment target |
| ---------------- | ---------------------- | ------------------------- | ----------------- |
| `/modules/tests` | `@hydraprotocol/tests` | e2e and integration tests | node              |

### Utilities / Misc

| Package                 | Name                          | Description                             | Deployment target |
| ----------------------- | ----------------------------- | --------------------------------------- | ----------------- |
| `/scripts`              | `scripts`                     | Miscelaneous Scripts                    | bash/node         |
| `/modules/migrations`   | `@hydraprotocol/migrations`   | Code to help setup testing snapshots \* | node cli          |
| `/modules/utils-solana` | `@hydraprotocol/utils-node`   | Miscelaneous Solana Utils \*            | browser/node      |
| `/modules/utils-node`   | `@hydraprotocol/utils-solana` | Miscelaneous Node utils \*              | node cli          |

\* _denotes items we may need to refactor in the future_

### Areas we are looking to refactor

| Package                 | Description                          | Plan                                                                                                                                        |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/modules/utils-solana` | Shared solana utils                  | Rename to `./modules/utils` Separate isomorphic utils from node specific ones: isomorphic - `./scripts/utils` node - `./scripts/utils-node` |
| `/modules/utils-node`   | Shared node specific utils           | Separate isomorphic utils from node specific ones: isomorphic - `./scripts/utils` node - `./scripts/utils-node`                             |
| `/modules/migrations`   | Code to help setup testing snapshots | Replace with setup cli based scripts                                                                                                        |

### Packages we will likely create in the future

| Package             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `@hydraprotocol/ui` | Our design system UI kit to be shared with other apps |
