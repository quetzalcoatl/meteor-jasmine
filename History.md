## 0.14.0

* Feature (Client Integration): Adds jasmine-jquery

## 0.13.7

* Fix (Server Unit): Mocking of Infinity values

## 0.13.6

* Make MeteorStubs available in all modes

## 0.13.5

* Use velocity:core@0.6.3

## 0.13.4

* Fix (Client Unit): Loading assets
* Fix (Client Unit): Loading the component mocker

## 0.13.3

* Fixes problem with meteorhacks:fast-render in Client Unit mode

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
