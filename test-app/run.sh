#!/bin/bash

#export VELOCITY_DEBUG=1
export JASMINE_PACKAGES_TO_INCLUDE_IN_UNIT_TESTS=package-to-include
meteor --settings settings.json
