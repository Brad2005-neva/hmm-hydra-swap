#!/usr/bin/env bash

GC=$(git rev-parse HEAD)
TARGET=src
if [[ -z "$GC" ]]; then 
  rm -rf $TARGET/gch.js
  exit 0
fi
# TODO: Would be nice to inline this into the HTML
echo "export {};" > $TARGET/gch.ts
echo "// eslint-disable-next-line @typescript-eslint/no-explicit-any"  >> $TARGET/gch.ts
echo "(window as any).gch = \"$GC\";" >> $TARGET/gch.ts
echo "" >> $TARGET/gch.ts