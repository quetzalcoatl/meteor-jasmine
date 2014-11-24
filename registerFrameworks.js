
frameworks = {}

if (process.env.JASMINE_CLIENT_INTEGRATION !== '0') {
  frameworks.clientIntegration = new ClientIntegrationTestFramework()
}

if (process.env.JASMINE_CLIENT_UNIT !== '0') {
  frameworks.clientUnit = new ClientUnitTestFramework()
}

/*
if (process.env.JASMINE_SERVER_INTEGRATION !== '0') {
  frameworks.serverIntegration = new ServerIntegrationTestFramework()
}
*/

if (process.env.JASMINE_SERVER_UNIT !== '0') {
  frameworks.serverUnit = new ServerUnitTestFramework()
}

if (process.env.VELOCITY !== '0' && !process.env.IS_MIRROR) {
  if (process.env.JASMINE_CLIENT_INTEGRATION !== '0') {
    frameworks.clientIntegration.registerWithVelocity()
    frameworks.clientIntegration.startFileCopier()
  }

  if (process.env.JASMINE_CLIENT_UNIT !== '0') {
    frameworks.clientUnit.registerWithVelocity()
  }

  if (process.env.JASMINE_SERVER_UNIT !== '0') {
    frameworks.serverUnit.registerWithVelocity()
  }

  Meteor.startup(function () {
    if (process.env.JASMINE_CLIENT_INTEGRATION !== '0') {
      frameworks.clientIntegration.startMirror()
    }
    //if (process.env.JASMINE_SERVER_INTEGRATION !== '0') {
      //frameworks.serverIntegration.runTests()
    //}
    if (process.env.JASMINE_CLIENT_UNIT !== '0') {
      frameworks.clientUnit.start()
    }
    if (process.env.JASMINE_SERVER_UNIT !== '0') {
      frameworks.serverUnit.start()
    }
  })
}
