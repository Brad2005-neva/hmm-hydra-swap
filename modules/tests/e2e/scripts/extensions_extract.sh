#!/bin/bash

set -e

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

source ./_vars.sh
rm -rf $EXT_FOLDER/$SOLLET_ID
mkdir -p $EXT_FOLDER
if ! command -v unzip &> /dev/null
then
  exit 1
fi
unzip -o $EXT_DOWNLOAD/$SOLLET_ID.crx.zip -d $EXT_FOLDER/$SOLLET_ID || exit 0
