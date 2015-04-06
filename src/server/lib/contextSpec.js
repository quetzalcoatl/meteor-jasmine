/* globals Assets: true, __jasmine: false */

beforeEach(function () {
  MeteorStubs.install()
  Meteor.isServer = true
  Meteor.isClient = false
  Meteor.settings = __jasmine.Meteor.settings
  Assets = __jasmine.Assets
})

afterEach(function () {
  MeteorStubs.uninstall()
})
