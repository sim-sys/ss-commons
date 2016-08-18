#!/bin/bash

set -e

TEST_DIR=`dirname "$0"`
cd $TEST_DIR

echo "Running RPC tests"
echo

pushd rpc > /dev/null
./test.sh
popd > /dev/null
