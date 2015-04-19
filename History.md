## 0.13.2

* Fix (Server Integration): Execute the test code after the app has initialized fully.
* Fix (Client Unit): Don't start Karma when no Client Unit tests exist.

## 0.13.1

* Fixes that `meteor --test` never finishes
* Fixes that Client Integration tests don't run when app redirects initially
* Added info that you should use the velocity:METEOR release for CI. See [README](https://github.com/Sanjo/meteor-jasmine#running-tests-in-continuous-integration).

## 0.13.0

* Uses velocity:core 0.6, which improves mirror stability and reliability
* Support for Windows
* Support for testing packages directly
* No more `Jasmine.onTest(function () { ... })` test wrapping
* The integration modes use the Meteor source handlers for compiling tests
* Removes ES6 support in Server Unit mode.
