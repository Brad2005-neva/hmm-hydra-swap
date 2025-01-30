#!/bin/bash 

set -e

FILE_TO_SUM=$1

if [[ -z "$FILE_TO_SUM" ]]; then
  echo 
  echo "Please specify a file to check"
  echo 
  exit 1
fi

SUM=$(sha256sum $FILE_TO_SUM | awk '{ print $1 }')


echo "┌──────────────────────────────────────────────────────────────────────┐"
echo "│                                                                      │"
echo "│            💂 👀   HERE IS YOUR BUILD CHECKSUM   👀 💂               │"
echo "│                                                                      │"
echo "│   $SUM   │"
echo "│                                                                      │"
echo "└──────────────────────────────────────────────────────────────────────┘"

