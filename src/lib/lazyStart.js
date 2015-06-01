/* globals lazyStart: true */

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
    var testsObserver = testsCursor.observe({
      added: _.once(function () {
        // Delay the stop because added can be called before observe returns
        Meteor.setTimeout(function () {
          testsObserver.stop()
        }, 5000)
        func()
      })
    })
  }
}
