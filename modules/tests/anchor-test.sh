#!/usr/bin/env bash

set -e

suite=${1:-all}

# Ensure BROWSER is not accidentally set
export BROWSER=

case $suite in
  all) glob="**/*.ts";;
  bench) glob="**/*bench*.ts";;
  faucet) glob="**/*faucet*.ts";;
  pools) glob="**/*pools*.ts";;
  amm) glob="**/*amm*.ts";;
  hmm) glob="**/*hmm*.ts";;
  sol) glob="**/*sol*.ts";;
  limits) glob="**/*limits*.ts";;
  links) glob="**/*links*.ts";;
  global) glob="**/*global*.ts";;
esac

ANCHOR_WALLET=~/.config/solana/id.json ANCHOR_PROVIDER_URL=http://0.0.0.0:8899 yarn ts-mocha -p ./tsconfig.json -t 1000000 protocol/$glob
