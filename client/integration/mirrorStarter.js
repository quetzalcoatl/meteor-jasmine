var requestMirror = _.once(function () {
  var options = {
    framework: frameworks.clientIntegration.name,
    mirrorId: frameworks.clientIntegration.name,
    rootUrlPath: '/?jasmine=true'
  }

  var customPort = parseInt(process.env.JASMINE_MIRROR_PORT, 10)
  if (_.isNumber(customPort)) {
    options.port = customPort
  }

  Meteor.call(
    'velocity/mirrors/request',
    options,
    function (error) {
      if (error) {
        logError(error)
      }
    }
  )
})

Meteor.startup(function () {
  var clientIntegrationTestsCursor = VelocityTestFiles.find(
    {targetFramework: frameworks.clientIntegration.name}
  )

  if (clientIntegrationTestsCursor.count() > 0) {
    requestMirror()
  } else {
    var clientIntegrationTestsObserver = clientIntegrationTestsCursor.observe({
      added: function () {
        clientIntegrationTestsObserver.stop()
        requestMirror()
      }
    })
  }
})
