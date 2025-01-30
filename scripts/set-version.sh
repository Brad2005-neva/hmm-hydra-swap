#!/bin/bash

VERSION=$1

function usage() {
  echo "USAGE:"
  echo ""
  echo "./scripts/set-version.sh [semver]"
  echo ""
  echo "Eg. "
  echo "  ./scripts/set-version.sh 1.2.3"
}

if [[ -z "$VERSION" ]]; then
  usage
  exit 1
fi

./scripts/get-npm-package-names.sh | xargs -I % sh -c "yarn workspace % version --no-git-tag-version --new-version ${VERSION}"
