/* globals frameworks: true */

frameworks = {}

isMirror = function () {
  return !!process.env.IS_MIRROR;
}

isMainApp = function () {
  return !isMirror();
}

isTestPackagesMode = function () {
  return !!process.env.VELOCITY_TEST_PACKAGES;
}

shouldRunFramework = function (frameworkName) {
  return process.env.FRAMEWORK === frameworkName || isTestPackagesMode();
}

if (process.env.VELOCITY !== '0') {

  // Server Integration
  if (process.env.JASMINE_SERVER_INTEGRATION !== '0') {
    frameworks.serverIntegration = new ServerIntegrationTestFramework()

    if (isMainApp()) {
      frameworks.serverIntegration.registerWithVelocity()
      if (!isTestPackagesMode()) {
        frameworks.serverIntegration.startMirror()
      }
    }

    if (shouldRunFramework('jasmine-server-integration')) {
      frameworks.serverIntegration.setupEnvironment()
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
  if (process.env.JASMINE_CLIENT_UNIT !== '0' && !isTestPackagesMode()) {
    frameworks.clientUnit = new ClientUnitTestFramework()

    if (isMainApp()) {
      frameworks.clientUnit.registerWithVelocity()
      Velocity.startup(function () {
        frameworks.clientUnit.start()
      })
    }
  }


  // Server Unit
  if (process.env.JASMINE_SERVER_UNIT !== '0' && !isTestPackagesMode()) {
    frameworks.serverUnit = new ServerUnitTestFramework()

    if (isMainApp()) {
      frameworks.serverUnit.registerWithVelocity()
      Velocity.startup(function () {
        frameworks.serverUnit.start()
      })
    }
  }

}
