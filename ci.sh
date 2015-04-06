#!/bin/bash

# Exit on first command that fails
set -e

# Run this script from the root folder of the repository with:
# ./ci.sh

# These lines will probalby do nothing on CI but useful when running locally to
# test the CI build process as sometimes phantomjs / node processes linger
echo "Killing node and phantomjs processes"
pkill -9 phantomjs || true
pkill -9 node || true

echo "Checking JSHint"
jshint .
echo "JSHint checks were successful"

echo "Testing sanjo:jasmine with test-app"

cd test-app

export JASMINE_PACKAGES_TO_INCLUDE_IN_UNIT_TESTS=package-to-include

meteor --test
