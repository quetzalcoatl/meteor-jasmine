#!/bin/bash

#export VELOCITY_DEBUG=1
#export JASMINE_LOG_LEVEL=debug
#export LONG_RUNNING_CHILD_PROCESS_LOG_LEVEL=debug
#export VELOCITY_USE_CHECKED_OUT_METEOR=1

VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter package-to-test --port 9999
