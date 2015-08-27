/* global
   JasmineVelocityTools: true
 */

(function () {
  JasmineVelocityTools = {
    translateFailuresToVelocityStackAndMessage: function translateFailuresToVelocityStackAndMessage(velocityResult, specResult, options) {
      if (specResult.failedExpectations[0]){
        var filtered = JasmineVelocityTools.filterStack(specResult.failedExpectations[0].stack);
        var parsed = parseStack.parse({stack: filtered});
        var stack = JasmineVelocityTools.removeStackTraceClutter(parsed, options);
        var message = _.extend({
          message: specResult.failedExpectations[0].message,
          stack: stack
        }, stack[0]);
        velocityResult.failureMessage = message.message;
        velocityResult.failureStackTrace = JasmineVelocityTools.formatMessage([message]);
      }
    },

    filterStack: function filterStack(stack) {
      var filteredStack = stack.split('\n').filter(function(stackLine) {
        return stackLine.indexOf('/node_modules/jasmine-core/') === -1;
      }).join('\n');
      return filteredStack;
    },

    removeStackTraceClutter: function removeStackTraceClutter(parsedStackTrace, options) {
      return _.chain(parsedStackTrace)
        .map(_.clone)
        .map(function makeFileUrlRelative(frame) {
          var rootUrl = options.rootUrl;
          var aliases = options.knownPaths;
          _.each(aliases, function(alias){
            var fullprefix = rootUrl + alias.prefix;
            if (frame.file.indexOf(fullprefix) === 0) {
              frame.file = alias.name + frame.file.substr(fullprefix.length);
            }
          });
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
    },

    formatMessage: function formatMessage(messages) {
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
  };

})()
