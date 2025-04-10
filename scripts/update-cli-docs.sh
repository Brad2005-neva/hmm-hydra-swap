#!/usr/bin/env bash

FILE=./docs/docs/cli/reference.md

rm -rf $FILE
cat << EOF >> $FILE
---
# This file is autogenerated
---

# Hydra CLI Reference
EOF

document() {
  CMD=$1
  echo "" >> $FILE
  echo "## \`$CMD\`" >> $FILE
  echo "" >> $FILE
  echo "\`\`\`shell" >> $FILE
  yarn -s $CMD --help >> $FILE
  echo "\`\`\`" >> $FILE
}

document "hydra lp"
document "hydra lp add-liquidity"
document "hydra lp initialize-global-state"
document "hydra lp initialize-pool-state"
document "hydra lp inspect"
document "hydra lp lsa"
document "hydra lp ls"
document "hydra lp remove-liquidity"
document "hydra lp set-feature"
document "hydra lp set-limits"
document "hydra lp set-prices-owner"
document "hydra lp swap"
document "hydra lp transfer-global-admin"
document "hydra lp transfer-pool-admin"