
frameworks = {}

function isMainApp() {
  return !process.env.FRAMEWORK;
}

function shouldRun(frameworkName) {
  return process.env.FRAMEWORK === frameworkName
}

if (process.env.VELOCITY !== '0') {
  frameworks.serverIntegration = new ServerIntegrationTestFramework()

  if (isMainApp()) {
    frameworks.serverIntegration.registerWithVelocity()
    frameworks.serverIntegration.startMirror();
  }

  if (shouldRun('jasmine-server-integration')) {
    if (process.env.IS_MIRROR) {
      Meteor.startup(
        function () {
          frameworks.serverIntegration.start()
        }
      )
    }
  }

  if (process.env.JASMINE_CLIENT_INTEGRATION === '1') {
    frameworks.clientIntegration = new ClientIntegrationTestFramework()
  }

  if (process.env.JASMINE_CLIENT_UNIT === '1') {
    frameworks.clientUnit = new ClientUnitTestFramework()
  }

  if (process.env.JASMINE_SERVER_UNIT === '1') {
    frameworks.serverUnit = new ServerUnitTestFramework()
  }

  if (!process.env.IS_MIRROR) {
    if (process.env.JASMINE_CLIENT_INTEGRATION === '1') {
      frameworks.clientIntegration.registerWithVelocity()
    }

    if (process.env.JASMINE_CLIENT_UNIT === '1') {
      frameworks.clientUnit.registerWithVelocity()
    }

    if (process.env.JASMINE_SERVER_UNIT === '1') {
      frameworks.serverUnit.registerWithVelocity()
    }

    Velocity.startup(function () {
      if (process.env.JASMINE_CLIENT_INTEGRATION === '1') {
        frameworks.clientIntegration.startMirror()
      }
      if (process.env.JASMINE_CLIENT_UNIT === '1') {
        frameworks.clientUnit.start()
      }
      if (process.env.JASMINE_SERVER_UNIT === '1') {
        frameworks.serverUnit.start()
      }
    })
  }
}
