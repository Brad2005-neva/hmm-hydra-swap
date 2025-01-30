#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"


source ./_vars.sh

mkdir -p $EXT_DOWNLOAD

# sollet
./crx-dl.py https://chrome.google.com/webstore/detail/sollet/$SOLLET_ID -o $EXT_DOWNLOAD/$SOLLET_ID.crx.zip
