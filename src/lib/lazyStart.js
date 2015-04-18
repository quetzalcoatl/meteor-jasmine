/* globals lazyStartTesting: true */

// Run the func when tests for the framework are available.
lazyStart = function (frameworkName, func) {
  var testsCursor = VelocityTestFiles.find(
    {targetFramework: frameworkName}
  )

  if (testsCursor.count() > 0) {
    func()
  } else {
    // Needed for `meteor --test`
    log.debug('No tests for ' + frameworkName + ' found. Reporting completed.')
    Meteor.call('velocity/reports/completed', {framework: frameworkName})
    testsCursor.observe({
      added: function () {
        this.stop()
        func()
      }
    })
  }
}
