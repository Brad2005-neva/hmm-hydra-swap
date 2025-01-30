#!/usr/bin/env bash

mkdir -p ~/.soteria
cd ~/.soteria && curl -k https://supercompiler.xyz/install | sh
echo Please update your PATH to the following:
echo export PATH=~/.soteria/soteria-linux-develop/bin/:$PATH
