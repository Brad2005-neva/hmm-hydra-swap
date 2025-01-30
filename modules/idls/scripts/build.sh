#!/usr/bin/env bash

# process idl
mkdir -p ./codegen/types
yarn ts-node ./scripts/process-idl.ts