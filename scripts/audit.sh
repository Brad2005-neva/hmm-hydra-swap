#!/usr/bin/env bash

# TODO:
# This was identifying high dependencies within docusaurus we cannot do 
# anything about so commenting out for now. 
# We need to be able to ignore packages here and this will require investigation
#  
# if [ "$(yarn audit --groups dependencies | grep "high")" ]; then 
#   echo "There are high severity dependencies"
#   echo $?
#   exit 1
# fi 

if [ "$(yarn audit --groups devDependencies | grep "critical")"]; then 
  echo "There are critical severity devDependencies"
  exit 1
fi 