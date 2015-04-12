var testFramework = new ClientIntegrationTestFramework()
Meteor.startup(function () {
  testFramework.runTests()
})
