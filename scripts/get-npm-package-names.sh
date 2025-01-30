#!/usr/bin/env bash


# List of module name matches we don't want to publish
DO_NOT_PUBLISH=(
  "wasm-test"
  "tests"
  "migrations"
  "core"
  "services"
)

function join_by { 
  local IFS="$1"
  shift
  echo "$*"
}

function get_package_json_filelist() {
  yarn -s workspaces info | jq -r '.[].location' | grep --color=never modules | awk '{ print $1 "/package.json" }'
}

function filter_block_list() {
  grep -vE $(join_by \| ${DO_NOT_PUBLISH[*]})
}

function get_npm_package_names() {
  get_package_json_filelist | xargs cat | jq -r '.name' | filter_block_list
}

get_npm_package_names