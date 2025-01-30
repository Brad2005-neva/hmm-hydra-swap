#!/usr/bin/env bash

source .env

docker run -ti ${NAME}:${VERSION} /bin/sh