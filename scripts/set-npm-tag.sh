#!/bin/bash

VERSION=$1
TAG=$2

function usage() {
  echo "USAGE:"
  echo ""
  echo "./scripts/set-npm-tag.sh [version] [tag]"
  echo ""
  echo "Eg. "
  echo "  ./scripts/set-npm-tag.sh 1.2.3 latest"
}

if [[ -z "$VERSION" ]]; then
  usage
  exit 1
fi

./scripts/get-npm-package-names.sh | xargs -I % echo "npm dist-tag add %@${VERSION} ${TAG}"
