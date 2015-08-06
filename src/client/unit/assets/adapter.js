/* globals __meteor_runtime_config__: false */
/* jshint camelcase: false */

/**
 * This file is based on:
 * https://github.com/karma-runner/karma-jasmine/blob/master/src/adapter.js
 *
 * The code that was copied from this file is under the MIT License
 * Copyright (C) 2011-2013 Google, Inc.
 * See: https://github.com/karma-runner/karma-jasmine/blob/master/LICENSE
 *
 * We added the Velocity reporting over DDP to the KarmaReporter.
 */

// We catch all the unstubbed Meteor references that we need.
// This allows us to stub Meteor while testing.
(function (Meteor, Tracker, DDP, __meteor_runtime_config__) {

  /**
   * Decision maker for whether a stack entry is considered relevant.
   * @param  {String}  entry Error stack entry.
   * @return {Boolean}       True if relevant, False otherwise.
   */
  function isRelevantStackEntry(entry) {
    // discard empty and falsy entries:
    return (entry ? true : false) &&
        // discard entries related to jasmine and karma-jasmine:
      !/\/(jasmine-core|karma-jasmine)\//.test(entry) &&
        // discard karma specifics, e.g. "at http://localhost:7018/karma.js:185"
      !/\/(karma.js|context.html):/.test(entry);
  }

  /**
   * Returns relevant stack entries.
   * @param  {String} stack Complete error stack trace.
   * @return {Array}        A list of relevant stack entries.
   */
  function getRelevantStackFrom(stack) {
    var relevantStack = [];

    stack = stack.split('\n');

    for (var i = 0; i < stack.length; i += 1) {
      if (isRelevantStackEntry(stack[i])) {
        relevantStack.push(stack[i]);
      }
    }

    return relevantStack;
  }

  /**
   * Custom formatter for a failed step.
   *
   * Different browsers report stack trace in different ways. This function
   * attempts to provide a concise, relevant error message by removing the
   * unnecessary stack traces coming from the testing framework itself as well
   * as possible repetition.
   *
   * @see    https://github.com/karma-runner/karma-jasmine/issues/60
   * @param  {Object} step Step object with stack and message properties.
   * @return {String}      Formatted step.
   */
  function formatFailedStep(step) {
    // Safari seems to have no stack trace,
    // so we just return the error message:
    if (!step.stack) { return step.message; }

    var relevantMessage = [];
    var relevantStack = [];
    var dirtyRelevantStack = getRelevantStackFrom(step.stack);

    // PhantomJS returns multiline error message for errors coming from specs
    // (for example when calling a non-existing function). This error is present
    // in both `step.message` and `step.stack` at the same time, but stack seems
    // preferable, so we iterate relevant stack, compare it to message:
    for (var i = 0; i < dirtyRelevantStack.length; i += 1) {
      if (step.message && step.message.indexOf(dirtyRelevantStack[i]) === -1) {
        // Stack entry is not in the message,
        // we consider it to be a relevant stack:
        relevantStack.push(dirtyRelevantStack[i]);
      } else {
        // Stack entry is already in the message,
        // we consider it to be a suitable message alternative:
        relevantMessage.push(dirtyRelevantStack[i]);
      }
    }

    // In most cases the above will leave us with an empty message...
    if (relevantMessage.length === 0) {
      // Let's reuse the original message:
      relevantMessage.push(step.message);

      // Now we probably have a repetition case where:
      // relevantMessage: ["Expected true to be false."]
      // relevantStack:   ["Error: Expected true to be false.", ...]
      if (relevantStack[0].indexOf(step.message) !== -1) {
        // The message seems preferable, so we remove the first value from
        // the stack to get rid of repetition :
        relevantStack.shift();
      }
    }

    // Example output:
    // --------------------
    // Chrome 40.0.2214 (Mac OS X 10.9.5) xxx should return false 1 FAILED
    //    Expected true to be false
    //    at /foo/bar/baz.spec.js:22:13
    //    at /foo/bar/baz.js:18:29
    return relevantMessage.concat(relevantStack).join('\n');
  }

  function SuiteNode(name, parent) {
    this.name = name;
    this.parent = parent;
    this.children = [];

    this.addChild = function (name) {
      var suite = new SuiteNode(name, this);
      this.children.push(suite);
      return suite;
    };
  }

  function processSuite(suite, pointer) {
    var child;
    var childPointer;

    for (var i = 0; i < suite.children.length; i++) {
      child = suite.children[i];

      if (child.children) {
        childPointer = pointer[child.description] = {_: []};
        processSuite(child, childPointer);
      } else {
        if (!pointer._) {
          pointer._ = [];
        }
        pointer._.push(child.description);
      }
    }
  }

  function getAllSpecNames(topSuite) {
    var specNames = {};

    processSuite(topSuite, specNames);

    return specNames;
  }

  /**
   * Very simple reporter for Jasmine.
   */
  function KarmaVelocityReporter(options) {

    var ddpParentConnection = options.ddpParentConnection
    var ancestors = []
    var tc = options.tc
    var jasmineEnv = options.env

    var currentSuite = new SuiteNode();

    /**
     * @param suite
     * @returns {boolean} Return true if it is system jasmine top level suite
     */
    function isTopLevelSuite(suite) {
      return suite.description === 'Jasmine_TopLevel_Suite';
    }

    /**
     * Jasmine 2.0 dispatches the following events:
     *
     *  - jasmineStarted
     *  - jasmineDone
     *  - suiteStarted
     *  - suiteDone
     *  - specStarted
     *  - specDone
     */

    this.jasmineStarted = function (data) {
      // TODO(vojta): Do not send spec names when polling.
      tc.info({
        total: data.totalSpecsDefined,
        specs: getAllSpecNames(jasmineEnv.topSuite())
      });
    };


    this.jasmineDone = function () {
      ddpParentConnection.call(
        'velocity/reports/completed',
        {framework: options.framework},
        function () {
          tc.complete({
            coverage: window.__coverage__
          })
        }
      )
    };


    this.suiteStarted = function (result) {
      ancestors.unshift(result.description)
      if (!isTopLevelSuite(result)) {
        currentSuite = currentSuite.addChild(result.description);
      }
    };


    this.suiteDone = function (result) {
      // In the case of xdescribe, only "suiteDone" is fired.
      // We need to skip that.
      if (result.description !== currentSuite.name) {
        return;
      }

      ancestors.shift()
      currentSuite = currentSuite.parent;
    };


    this.specStarted = function (specResult) {
      specResult.startTime = new Date().getTime();
    };


    this.specDone = function (specResult) {
      var skipped = specResult.status === 'disabled' || specResult.status === 'pending';
      var time = skipped ? 0 : new Date().getTime() - specResult.startTime

      var velocitySpecDone = function (callback) {
        if (!skipped) {
          var velocityResult = {
            id: 'jasmine:' + options.mode + ' | ' + specResult.id,
            framework: options.framework,
            name: specResult.description,
            fullName: specResult.fullName,
            pending: specResult.status === 'pending',
            result: specResult.status,
            duration: time,
            ancestors: ancestors,
            timestamp: new Date(),
            isClient: true
          }
          if (specResult.failedExpectations[0]){
            velocityResult.failureMessage = specResult.failedExpectations[0].message
            velocityResult.failureStackTrace = specResult.failedExpectations[0].stack
          }

          ddpParentConnection.call('velocity/reports/submit', velocityResult, function (error){
            if (error){
              console.error('ERROR WRITING TEST', error)
            }
            callback()
          })
        } else {
          callback()
        }
      }

      var karmaSpecDone = function () {
        var result = {
          description : specResult.description,
          id          : specResult.id,
          log         : [],
          skipped     : skipped,
          success     : specResult.failedExpectations.length === 0,
          suite       : [],
          time        : time
        };

        // generate ordered list of (nested) suite names
        var suitePointer = currentSuite;
        while (suitePointer.parent) {
          result.suite.unshift(suitePointer.name);
          suitePointer = suitePointer.parent;
        }

        if (!result.success) {
          var steps = specResult.failedExpectations;
          for (var i = 0, l = steps.length; i < l; i++) {
            result.log.push(formatFailedStep(steps[i]));
          }
        }

        tc.result(result);
      }

      velocitySpecDone(karmaSpecDone)
      delete specResult.startTime;
    };
  }

  var createStartFn = function (karma) {
    return function () {
      window.ddpParentConnection = DDP.connect(__meteor_runtime_config__.ROOT_URL)

      // Wait with running the tests until the DDP connection is established
      Tracker.autorun(function (computation) {
        if (window.ddpParentConnection.status().connected) {
          computation.stop()

          // Force to not run in a computation
          setTimeout(function () {
            var frameworkName = 'jasmine-client-unit'
            window.ddpParentConnection.call('velocity/reports/reset', {framework: frameworkName}, function () {
              // Add the Velocity Reporter
              var jasmineEnv = window.jasmine.getEnv()
              var velocityReporter = new KarmaVelocityReporter({
                mode: 'Client Unit',
                framework: frameworkName,
                env: jasmineEnv,
                ddpParentConnection: window.ddpParentConnection,
                tc: karma
              })
              jasmineEnv.addReporter(velocityReporter)
              jasmineEnv.execute()
            })
          })
        }
      })
    }
  }

  // Note: window.__karma__ comes from the parent context
  // and is always the same object for each run.
  // This is why we have to check if window.__karma__
  // is already hooked from a previous run.
  // We also need to store the original functions on window.__karma__.

  // We overwrite the original Karma start method
  // so we can use our KarmaVelocityReporter instead.
  window.__karma__.start = createStartFn(window.__karma__)

})(Meteor, Tracker, DDP, __meteor_runtime_config__)
