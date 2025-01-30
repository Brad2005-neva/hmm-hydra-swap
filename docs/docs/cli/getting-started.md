---
slug: /cli-getting-started
---

# Getting Started

## Prerequisiites

- [Solana CLI Tools (>= 1.10.39)](https://docs.solana.com/cli/install-solana-cli-tools)
- [Node (>= v16)](https://nodejs.org/en/download/)

## Installation

Install the `hydra` cli globally:

```shell
$ npm install --location global @hydraprotocol/cli@latest
```

You can verify the installation by checking the version.

```shell
$ hydra --version
5.3.0
```

If everything is setup correctly you should be able to get a list of available pools

```shell
$ hydra lp ls

 PoolID  PublicKey
──────── ──────────────────────────────────────────────
 0       G9ZcGVgcdoWg9fQ9Q4qbTjypFjL3u2rVQ2s64yeX7vVk
 1       GHsWNK1MjMD3tswxaitEefDL7YqR8bhRBiR4sqnjWk9B
 2       8fjdRjPQGCqtzUXuxV9gW3xQyMJMW51owbt3JKeBY7F7
 3       2JpTfBxZtBrbcTGjetVqMbCnkpcc2bxQKsn8rTGQRpp9
 4       GdRhaz3nFWYaG7LeQGrF724YchRty2w1SGkNNNf45iGA
 5       4DFk8ectLE44js7RqNzvH497HfZk9T7ba4xQepwoEwoT
 6       AywjbGjvVQ3j3yff88VvTBpdCRvwBzD4wuUVA2ewGC9j
```
