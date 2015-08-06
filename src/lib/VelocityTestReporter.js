/* global
   VelocityTestReporter: true
 */

(function (Meteor) {
  var noopTimer = {
    start: function() {},
    elapsed: function() { return 0 }
  }

  VelocityTestReporter = function VelocityTestReporter(options) {
    var self = this,
      timer = options.timer || noopTimer,
      ddpParentConnection = options.ddpParentConnection,
      ancestors = [],
      _jasmineDone

    self.mode = options.mode

    var saveTestResult = Meteor.bindEnvironment(function saveTestResult(test) {
      var result = {
        id: 'jasmine:' + self.mode + ' | ' + test.id,
        //async: test.async,
        framework: options.framework,
        name: test.description,
        fullName: test.fullName,
        pending: test.status === 'pending',
        result: test.status,
        duration: timer.elapsed(),
        //timeOut: test._timeout,
        //timedOut: test.timedOut,
        ancestors: ancestors,
        timestamp: new Date(),
        isClient: !!options.isClient,
        isServer: !!options.isServer
      }
      if (test.failedExpectations[0]){
        var stack = removeStackTraceClutter(parseStack.parse({stack: filterStack(test.failedExpectations[0].stack)}))
        var message = _.extend({
          message: test.failedExpectations[0].message,
          stack: stack
        }, stack[0])
        result.failureMessage = message.message
        result.failureStackTrace = formatMessage([message])
      }

      if (Meteor.isClient || process.env.IS_MIRROR) {
        ddpParentConnection.call('velocity/reports/submit', result, function (error){
          if (error){
            console.error('ERROR WRITING TEST', error)
          }
        })
      } else {
        Meteor.call('velocity/reports/submit', result, function(error){
          if (error){
            console.error('ERROR WRITING TEST', error)
          }
        })
      }
    }, function (error) {
      console.error(error)
    })

    if (Meteor.isClient) {
      _jasmineDone = function () {
        ddpParentConnection.call(
          'velocity/reports/completed',
          {framework: options.framework},
          function () {
            if (options.onComplete) {
              options.onComplete()
            }
          }
        )
      }
    } else if (Meteor.isServer) {
      _jasmineDone = Meteor.bindEnvironment(function jasmineDone() {
        if (options.onComplete) {
          options.onComplete()
        }
      }, function (error) {
        console.error(error)
        if (options.onComplete) {
          options.onComplete()
        }
      })
    }

    self.jasmineDone = _jasmineDone

    self.suiteStarted = function(result) {
      ancestors.unshift(result.description)
    }

    self.suiteDone = function() {
      ancestors.shift()
    }

    self.specStarted = function () {
      timer.start()
    }

    self.specDone = function(result) {
      var skipped = result.status === 'disabled' || result.status === 'pending'
      if (!skipped) {
        saveTestResult(result)
      }
    }

    function filterStack(stack) {
      var filteredStack = stack.split('\n').filter(function(stackLine) {
        return stackLine.indexOf('/node_modules/jasmine-core/') === -1;
      }).join('\n');
      return filteredStack;
    }

    function removeStackTraceClutter(parsedStackTrace) {
      return _.chain(parsedStackTrace)
        .map(_.clone)
        .map(function makeFileUrlRelative(frame) {
          var rootUrl = Meteor.absoluteUrl();
          if (frame.file.indexOf(rootUrl) === 0) {
            frame.file = frame.file.substr(rootUrl.length);
          }
          return frame;
        })
        .map(function removeCacheBustingQuery(frame) {
          frame.file = frame.file.replace(/\?[a-z0-9]+$/, '');
          return frame;
        })
        .map(function normalizePackageName(frame) {
          frame.file = frame.file.replace('local-test:', '');
          return frame;
        })
        .map(function removeUselessFunc(frame) {
          if (frame.func === 'Object.<anonymous>') {
            frame.func = null;
          }
          return frame;
        })
        .value();
    }

    function formatMessage(messages) {
      var out = '';
      var already = {};
      var indent = '';

      _.each(messages, function (message) {
        var stack = message.stack || [];

        var line = indent;
        if (message.file) {
          line+= message.file;
          if (message.line) {
            line += ":" + message.line;
            if (message.column) {
              // XXX maybe exclude unless specifically requested (eg,
              // for an automated tool that's parsing our output?)
              line += ":" + message.column;
            }
          }
          line += ": ";
        } else {
          // not sure how to display messages without a filenanme.. try this?
          line += "error: ";
        }
        // XXX line wrapping would be nice..
        line += message.message;
        if (message.func && stack.length <= 1) {
          line += " (at " + message.func + ")";
        }
        line += "\n";

        if (stack.length > 1) {
          _.each(stack, function (frame) {
            // If a nontrivial stack trace (more than just the file and line
            // we already complained about), print it.
            var where = "";
            if (frame.file) {
              where += frame.file;
              if (frame.line) {
                where += ":" + frame.line;
                if (frame.column) {
                  where += ":" + frame.column;
                }
              }
            }

            if (! frame.func && ! where)
              return; // that's a pretty lame stack frame

            line += "  at ";
            if (frame.func)
              line += frame.func + " (" + where + ")\n";
            else
              line += where + "\n";
          });
          line += "\n";
        }

        // Deduplicate messages (only when exact duplicates, including stack)
        if (! (line in already)) {
          out += line;
          already[line] = true;
        }
      });

      return out;
    }
  }

})(Meteor)
