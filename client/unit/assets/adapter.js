// We catch all the unstubbed Meteor references that we need.
// This allows us to stub Meteor while testing.
(function (Meteor, Tracker, DDP, __meteor_runtime_config__) {

  var createStartFn = function () {
    return function (config) {
      window.ddpParentConnection = DDP.connect(__meteor_runtime_config__.ROOT_URL)

      // Wait with running the tests until the DDP connection is established
      Tracker.autorun(function (computation) {
        if (window.ddpParentConnection.status().connected) {
          computation.stop()

          // Force to not run in a computation
          setTimeout(function () {
            var frameworkName = 'jasmine-client-unit'
            window.ddpParentConnection.call('velocity/reports/reset', {framework: frameworkName})

            // Add the Velocity Reporter
            var jasmineEnv = window.jasmine.getEnv()
            var velocityReporter = new VelocityTestReporter({
              mode: 'Client Unit',
              framework: frameworkName,
              env: jasmineEnv,
              timer: new window.jasmine.Timer(),
              ddpParentConnection: window.ddpParentConnection
            })
            jasmineEnv.addReporter(velocityReporter)

            // Start the Karma test run
            window.__karma__._original_start.apply(this, arguments)
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

  if (!window.__karma__._original_start) {
    window.__karma__._original_start = window.__karma__.start
  }

  // We pre hook the original Karma start method to do our initialisation
  window.__karma__.start = createStartFn(window.__karma__)


  if (!window.__karma__._original_complete) {
    window.__karma__._original_complete = window.__karma__.complete
  }

  // Give DDP some extra time to send all results before Karma shuts down
  window.__karma__.complete = function (result) {
    setTimeout(function () {
      window.__karma__._original_complete.apply(this, arguments)
    }, 1000)
  }

})(Meteor, Tracker, DDP, __meteor_runtime_config__)
