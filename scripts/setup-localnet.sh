#!/usr/bin/env bash

set -e

# This is a utility script for hashing out deployment 
# It is designed to be used against a blank test validator running
# Eg. Terminal 1: 
#  ./scripts/setup-blank-validator.sh 
# Then run this script

yarn wallet keys/users/god6xgrG3ZnkRTPtb7J3nDs1k8P7GGo43QZcN4ZLf5D.json 
yarn deploy http://localhost:8899
./scripts/setup-tokens.sh localnet
./scripts/setup-pools.sh localnet 