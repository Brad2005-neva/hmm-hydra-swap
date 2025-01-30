# Hydraswap Docker Strategy

## Commands

Each folder has the following management commands:

| file         | description                    |
| ------------ | ------------------------------ |
| `./build.sh` | build the image                |
| `./run.sh`   | run the container and enter it |
| `./push.sh`  | push the image                 |

| file   | description                              |
| ------ | ---------------------------------------- |
| `.env` | Environment config specific to the image |

## NOTE: Update `.env` before you build

Each container makes use of a `.env` file that configures the current `NAME` and `VERSION` for that container. Every time you build be sure to update the file to the latest version.

## Process for updating a container

1. Ensure you have a personal access token from github for our org and are loged in to ghcr with it from docker.
1. First update the `.env`
   ```bash
   ANCHOR_VERSION=0.25.0 < --- update these if changed
   SOLANA_VERSION=1.10.39 < --- update these if changed
   VERSION=0.0.33 # < --- update this number
   NAME=ghcr.io/hydraswap-io/hydraswap-dev
   ```
1. Run `./build.sh`
1. Run `./push.sh`

## Future plans/ideas

Currently we use a single Dockerfile for all of ci. In the future we would like to do the following:

- CI is run in Dockerfiles the pertain to the step it requires

| stage           | shared output                             | deps                       |
| --------------- | ----------------------------------------- | -------------------------- |
| build           | create the '\*.so' files and ts artifacts | rust, ts                   |
| test            | run tests                                 | playwright base, ts, rust  |
| security        |                                           | rust, ts                   |
| deploy-frontend | deploy /app/build files to ipfs           | ipfs actions               |
| deploy-devnet   | deploy '\*.so' files to solana            | rust,solana toolchain only |

## Verified build

Anchor verifiable build does not work for us because of a few factors including our monorepo setup our dependencies and the docker environment we are using.
We can simply ensure builds are done within a canonical docker environment to do effectively the same thing. Currently our build step looks for docker and if it can find docker it will use the CI docker container. If not the assumption is it is in the CI docker container itself.
