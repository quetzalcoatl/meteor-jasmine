/* globals frameworks: true */

frameworks = {}

function isMainApp() {
  return !process.env.FRAMEWORK;
}

function shouldRun(frameworkName) {
  return process.env.FRAMEWORK === frameworkName
}

if (process.env.VELOCITY !== '0') {

  // Server Integration
  if (process.env.JASMINE_SERVER_INTEGRATION !== '0') {
    frameworks.serverIntegration = new ServerIntegrationTestFramework()

    if (isMainApp()) {
      frameworks.serverIntegration.registerWithVelocity()
      frameworks.serverIntegration.startMirror()
    }

    if (shouldRun('jasmine-server-integration')) {
      Meteor.startup(function () {
        frameworks.serverIntegration.start()
      })
    }
  }


  // Client Integration
  if (process.env.JASMINE_CLIENT_INTEGRATION !== '0') {
    frameworks.clientIntegration = new ClientIntegrationTestFramework()

    if (isMainApp()) {
      frameworks.clientIntegration.registerWithVelocity()
      frameworks.clientIntegration.startMirror()
    }
  }


  // Client Unit
  if (process.env.JASMINE_CLIENT_UNIT !== '0') {
    frameworks.clientUnit = new ClientUnitTestFramework()

    if (isMainApp()) {
      frameworks.clientUnit.registerWithVelocity()
      Velocity.startup(function () {
        frameworks.clientUnit.start()
      })
    }
  }


  // Client Server
  if (process.env.JASMINE_SERVER_UNIT !== '0') {
    frameworks.serverUnit = new ServerUnitTestFramework()

    if (isMainApp()) {
      frameworks.serverUnit.registerWithVelocity()
      Velocity.startup(function () {
        frameworks.serverUnit.start()
      })
    }
  }

}
