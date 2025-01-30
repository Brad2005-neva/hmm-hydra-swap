[← 🏠](./CONTRIBUTING.md)

# Installation

## Install dependencies

Some of the following dependencies can be installed via the make task: `make install_dependencies`.
Please make sure you valid you have all the correct versions post install.

### Installing rust:

Direction can be found [here](https://www.rust-lang.org/tools/install)

```
$ rustc --versionTechnical
rustc 1.60.0 (7737e0b5c 2022-04-04)
```

### Installing solana cli tools:

Directions can be found [here](https://docs.solana.com/cli/install-solana-cli-tools)

```
$ solana --version
solana-cli 1.10.39 (src:devbuild; feat:2324890699)
```

Note: for Apple M1 users recommended installation approach _without_ rosetta:

```
brew install coreutils
git clone --depth 1 --branch v1.13.0 https://github.com/solana-labs/solana.git
cd solana
./scripts/cargo-install-all.sh .
solana --version
```

### Installing NodeJs

Direction can be found [here](https://nodejs.org/en/)

```
$ node --version
v16.14.2
```

### Installing yarn

Direction can be found [here](https://yarnpkg.com/getting-started/install)

```
$ yarn --version
1.22.18
```

### Installing wasm-pack

`cargo install wasm-pack`

```
$ wasm-pack -V
wasm-pack 0.10.2
```

`cargo install wasm-bindgen-cli`

### Installing Anchor:

Directions can be found [here](https://project-serum.github.io/anchor/getting-started/installation.html).

You can also use our own fork by running `make install_anchor`

```
$ anchor --version
anchor-cli 0.25.0
```

### Install JQ

Some scripts require JQ. (any version is probably ok)

```
$ jq --version
jq-1.6
```

### Install Other Dependencies

Some scripts require pidof.

```
$ pidof -v
pidof version 0.1.4
```

### Ensure you have ghcr access

Until we are open source our build process involves downloading a docker image from ghcr you will need to be logged in to recieve the image:

https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

1. Head [here](https://github.com/settings/tokens/new?scopes=write:packages) to create a new PAT
2. Save the PAT to an env var
   ```
   $ export CR_PAT=YOUR_TOKEN
   ```
3. Use the env var to login with your github username:
   ```
   $ echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
   > Login Successful
   ```
4. Head to https://github.com/orgs/hydraswap-io/packages and try pulling one of the packages:

   ```
   $ docker pull ghcr.io/hydraswap-io/hydraswap-ci:0.0.24
   ```

### Install TS dependencies

`yarn`

### Build the project

`yarn build`

If you do not wish to use docker you can also skip it by passing in an env flag:

`SKIP_DOCKER=1 yarn build`
