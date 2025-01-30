# Val

A useful wrapper around solana's `solana-test-validator` for modern blockchain projects.

### Getting started

Install with pnpm, npm or yarn in the usual way.

```
npm install -g @hydraprotocol/val
```

or

```
yarn global add @hydraprotocol/val
```

etc.

### Usage

Start a validator:

```bash
val
```

Start a validator in the background:

```bash
val -d
```

Save a validator snapshot called `foo`:

```bash
val -d

# make some transactions then...

val save foo # will save the validator state to the snapshot
```

Start the validator from the saved snapshot

```
val foo
```

### Features

- Save and restore your validator from a snapshot.
- Manage your validator from within tests.
- Run as a background service
- Run in the foreground
- Display logs

_More docs to come..._

```
USAGE:

  val                   - start the validator
  val -d                - start the validator as a background service
  val save [alias]      - save the validator state to an alias
  val [alias]           - start the validator from the alias state
  val clean             - clean the validator state removing working files
  val list              - list the saved snapshots
  val status            - check on the status of the validator

FLAGS:
  --background, -d      - start the validator as a background process
  --help, -h            - show this message
  --quiet, -q           - suppress output
```
