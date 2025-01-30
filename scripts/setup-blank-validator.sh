#!/usr/bin/env bash

set -e

# This is a script to help debug deployment issues here we clone 
# Pyth accounts to a raw validator. This is done because val will 
# automatically load our test fixtures and deploy our contracts

NETWORK=http://localhost:8899

rm -rf test-ledger && \
  solana-test-validator \
  --clone gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s \
  --clone HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J \
  --clone EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw \
  --clone J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --clone 38xoQ4oeJCBrcVvca2cGk7iV1dAfrmTR1kmhSCJQ8Jto \
  --url devnet 
