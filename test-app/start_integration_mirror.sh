#!/bin/bash

export PATH=/Users/jonas/Projects/meteor:$PATH
export VELOCITY_DEBUG=1

export MONGO_URL='mongodb://127.0.0.1:3001/jasmine-server-integration'
export HOST=localhost:5000
export FRAMEWORK='jasmine-server-integration'
export PARENT_URL='http://localhost:3000'
export IS_MIRROR='true'
export HANDSHAKE='true'

meteor run --test-app --test-app-path ~/tmp/test-app --port 5000 --include-tests jasmine/server/integration
