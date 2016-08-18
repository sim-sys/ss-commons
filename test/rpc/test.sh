#!/bin/bash

set -e

echo "Generating stubs"
echo

FLOW=../../tools/node_modules/.bin/flow

node ../../src-compiled/rpc/cli.js service.yml > server/stubs.js
node ../../src-compiled/rpc/cli.js service.yml > stubs.js

echo "Checking code integrity with flow"

$FLOW check

echo "Running server"
docker-compose up -d
sleep 1 # TODO use docker health checks?

docker-compose down
