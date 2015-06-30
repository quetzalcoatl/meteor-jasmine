# jasmine

Easily write and run [Jasmine 2.1](http://jasmine.github.io/2.1/introduction.html) tests for all your Meteor code.

### Installation

```bash
meteor add sanjo:jasmine
```

You also need to install a [Velocity Reporter package](https://github.com/meteor-velocity/velocity#reporters) to see the test results.

```bash
meteor add velocity:html-reporter
```

### Getting started

To learn more about testing with Meteor you should buy the [Meteor Testing Manual](http://www.meteortesting.com/?utm_source=jasmine&utm_medium=banner&utm_campaign=jasmine).

[![](http://www.meteortesting.com/img/tmtm.gif)](http://www.meteortesting.com/?utm_source=jasmine&utm_medium=banner&utm_campaign=jasmine)

### History

You can find the latest changes [here](https://github.com/Sanjo/meteor-jasmine/blob/master/History.md).

### Usage

#### Testing an application

Tests run automatically while the app runs in development mode locally.
The test results are outputted by the reporter that you have additionally installed.

#### Testing a package

You can also test packages directly. You can find an example [here](https://github.com/Sanjo/meteor-jasmine/tree/master/test-app/packages/package-to-test).

You can run the tests for this package with:

```bash
VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter package-to-test
```

If you want to debug your server code, just add `--debug-port 5858` as argument to the command.

For CI you just need to add the `--velocity` flag:

```bash
VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter --velocity --release velocity:METEOR@1.1.0.2_3 package-to-test
```

If your package is not located in an app you can test it with:

```bash
VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter --velocity --release velocity:METEOR@1.1.0.2_3 ./
```

You can find a list of all available command options [here](https://github.com/meteor/meteor/blob/120febbf8a40f262e436d907ff36e469a19d7698/tools/commands.js#L1295-L1339).

### Troubleshooting

Each test mode (except server unit mode) creates a log file in the folder `.meteor/local/log/`. If something is not working you should have a look in the log file.

If you need help, look for an existing GitHub issue that describes your problem. If you don't find one that is exactly the same issue, create a new one.

### Further reading

* [Jasmine 2.1 Documentation](http://jasmine.github.io/2.1/introduction.html)
* [sanjo:jasmine Wiki](https://github.com/Sanjo/meteor-jasmine/wiki)

### Examples and Tutorials

* [Leaderboard example with Jasmine tests](https://github.com/meteor-velocity/velocity-example/tree/jasmine-only/tests/jasmine/) (by Jonas Aschenbrenner)
* [Bullet-proof Meteor applications](http://doctorllama.wordpress.com/2014/09/22/bullet-proof-internationalised-meteor-applications-with-velocity-unit-testing-integration-testing-and-jasmine/) (by Tomas Trescak)
* [Introduction to Client Integration Tests](http://webtempest.com/meteor-js-testing) (by Web Tempest)

### Testing modes

Each testing mode has different characteristics. Each testing mode has an own folder.

#### Server

##### Server Integration Test Mode

* You can run unit and integration tests inside a copy of your app.
* Place your server integration tests in the folder `tests/jasmine/server/integration/` or a subfolder of it.

##### Server Unit Test Mode

* You can unit test server app code.
* The Meteor API and all packages are stubbed in this mode.
* Place your server unit tests in the folder `tests/jasmine/server/unit/` or a subfolder of it.

#### Client

In both client modes [jasmine-jquery](https://github.com/velesin/jasmine-jquery) is available.

##### Client Integration Test Mode

* You can test client code.
* The tests are executed directly inside the browser in a copy of your app.
* Nothing is automatically stubbed.
* Place your client integration tests in the folder `tests/jasmine/client/integration/` or a subfolder of it.

> __Tip:__ Use this mode when you want to test the communication between client and server.
> In other cases you should probably use the Client Unit Test mode.

##### Client Unit Test Mode

* You can test client code.
* The tests are executed directly inside the browser.
* Nothing is automatically stubbed (currently).
* Place your client unit tests in the folder `tests/jasmine/client/unit/` or a subfolder of it.

By default tests run in Google Chrome browser. To run in another browser use the `JASMINE_BROWSER` environment variable. For example:

```bash
JASMINE_BROWSER=PhantomJS meteor [options]
```

> __Note:__ Tests currently only run in Google Chrome, PhantomJS, and Firefox. If you need support for another Browser please [open an issue](https://github.com/Sanjo/meteor-jasmine/issues/new).

If you want to use PhantomJS for running your tests, you must install PhantomJS
globally with `npm install -g phantomjs`.

### Disabling testing modes

By default all test modes are activated.
If you don't use some of the testing modes you can disable them with an environment variable:

* `JASMINE_SERVER_UNIT=0`
* `JASMINE_SERVER_INTEGRATION=0`
* `JASMINE_CLIENT_UNIT=0`
* `JASMINE_CLIENT_INTEGRATION=0`

### Running tests in Continuous Integration

Use the commmand:

```bash
meteor --test --release velocity:METEOR@1.1.0.2_3
```

The release `velocity:METEOR@1.1.0.2_3` contains a fix for running
the client integration tests.

### Mocks

#### Mocking Meteor

This package ships with mocks for the Meteor API. You can mock the Meteor API in your tests with:

```javascript
beforeEach(function () {
  MeteorStubs.install();
});

afterEach(function () {
  MeteorStubs.uninstall();
});
```

This is done automatically for server unit tests. To disable on the server for certain packages set the environment variable `JASMINE_PACKAGES_TO_INCLUDE_IN_UNIT_TESTS`. For example

    export JASMINE_PACKAGES_TO_INCLUDE_IN_UNIT_TESTS=dburles:factory 

You need to do it yourself for your client tests if you want to write
unit tests that run in the browser.

#### Mocking objects

You can mock any object with the global helper function `mock`.
This will avoid unwanted side effects that can affect other tests.
Here is an example how to mock the Players collection of the Leaderboard example:

```javascript
beforeEach(function () {
  mock(window, 'Players');
});
```

This will mock the Players collection for each test.
The original Players collection is automatically restored after each test.

#### Creating more complex mocks

You can also create mocks manually. I would suggest to use the following pattern:

Create a mock service with a method `install` and `uninstall` ([example for Meteor](https://github.com/alanning/meteor-stubs/blob/master/index.js))

  * install: Saves the original object and mocks it
  * uninstall: Restores the original object

This pattern allows you to enable mocks only for specific tests and have a clean and independent mock for each test.

### Copyright

The code is licensed under the MIT License (see LICENSE file).

The boot.js scripts are based on code that is part of Jasmine 2.0 ([LICENSE](https://github.com/pivotal/jasmine/blob/v2.0.0/MIT.LICENSE)).
