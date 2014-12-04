# jasmine

Easily write and run [Jasmine 2.0 features](http://jasmine.github.io/2.0/introduction.html) tests for all your Meteor code.

### Installation

```bash
meteor add sanjo:jasmine
meteor add velocity:html-reporter
```

### Usage

Tests run automatically while the app runs in development mode locally.
You can see the test results in the terminal and in the html-reporter overlay.

### Further reading

* [Jasmine 2.0 Documentation](http://jasmine.github.io/2.0/introduction.html)
* [sanjo:jasmine Wiki](https://github.com/Sanjo/meteor-jasmine/wiki)

### Examples and Tutorials

* [Integration and Unit tests for a refactored version of the Leaderboard example (by Jonas Aschenbrenner)](https://github.com/meteor-velocity/velocity-example/tree/jasmine-only/tests/jasmine/).
* [Comprehensive tutorial about testing all common aspects of a Meteor app (by Tomas Trescak)](http://doctorllama.wordpress.com/2014/09/22/bullet-proof-internationalised-meteor-applications-with-velocity-unit-testing-integration-testing-and-jasmine/)

### Testing modes

Each testing mode has different characteristics. Each testing mode has an own folder.

#### Server

##### Server Unit Test Mode

* You can unit test server app code.
* The tests run isolated from your app.
* The Meteor API and all packages are stubbed in this mode.
* Place your server unit tests in the folder `tests/jasmine/server/unit/` or a subfolder of it.

##### Server Integration Test Mode

Not available yet. Will be added in the near future.

#### Client

##### Client Unit Test Mode

* You can test client code.
* The tests are executed directly inside the browser.
* Nothing is automatically stubbed.
* Place your client unit tests in the folder `tests/jasmine/client/unit/` or a subfolder of it.

By default tests run in Google Chrome browser. To run in another browser use the `JASMINE_BROWSER` environment variable. For example:

```bash
JASMINE_BROWSER=PhantomJS meteor [options]
```

> __Note:__ Tests currently only run in Google Chrome and PhantomJS. If you need support for another Browser please [open an issue](https://github.com/Sanjo/meteor-jasmine/issues/new).

##### Client Integration Test Mode

* You can test client code.
* The tests are executed directly inside the browser in a copy of your app.
* Nothing is automatically stubbed.
* Place your client integration tests in the folder `tests/jasmine/client/integration/` or a subfolder of it.

> __Tip:__ Use this mode when you want to test the communication between client and server.
> In other cases you should probably use the Client Unit Test mode.

### Running tests once (for Continuous Integration)

Use the commmand:

```bash
JASMINE_SINGLE_RUN=1 meteor --test
``

### Stubs

Files in `tests/jasmine` folder (or a subfolder of it) that end with `-stubs.js` or `-stub.js` are treated as stubs and are loaded before the app code.

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

This is done automatically for server unit tests.
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
