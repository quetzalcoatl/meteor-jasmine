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

      var formatOptions = { rootUrl: Meteor.absoluteUrl() };
      JasmineVelocityTools.translateFailuresToVelocityStackAndMessage(result, test, formatOptions);

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
  }

})(Meteor)
