#!/bin/sh

set -e

wasm-pack build -d .pkg/web --target web --out-name index --release
wasm-pack build -d .pkg/node --target nodejs --out-name index --release
rm .pkg/node/package.json 
rm .pkg/web/package.json