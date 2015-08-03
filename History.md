## 0.16.2

* Chore (Client Unit): Upgrade Karma from 0.13.2 to 0.13.3
* Fix (Client Unit): Potential fix for Karma mtime error

## 0.16.1

* Fix (Server Integration): Source map support on server side

## 0.16.0

* Improvement (Integration modes): Much better error stack traces for client tests.

## 0.15.5

* Fix (Client Integration): Don't create mirror iFrame when already in iFrame

## 0.15.4

* Fix: Bug with marking stacks (introduced in 0.15.3)

## 0.15.3

* Fix (Client Integration): Error when running app tests when package tests have been run
    on the same host and port before.
* Improvement: Improves test error stack trace. Shows only relevant stack trace lines in an improved format.

## 0.15.2

* Fix (Server Integration): Tests with exceptions did no longer fail since 0.15.1

## 0.15.1

* Fix (Server Integration): Binding async tests to environment correctly

## 0.15.0

* Update (Client Unit): Use latest Karma
* Feature (Client Unit): Make Karma configurable
* Fix (Client Unit): Iron Router is now automatically disabled
* Fix (Server Integration): Async tests that execute unbound functions now work
* Feature (Client Integration, Server Integration): Specs can also be written with ES2015

## 0.14.0

* Feature (Client Integration): Adds jasmine-jquery
* Fix (Client Integration): Tests didn't rerun when the route was changed in the mirror

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
