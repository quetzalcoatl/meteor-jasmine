/* global
   Velocity: false
*/

/**
 * Design:
 * - Let Meteor load the tests
 * - Let Meteor restart the mirror when a file changed.
 *   This implicates only one test run per mirror run.
 */

var path = Npm.require('path'),
    util = Npm.require('util'),
    vm = Npm.require('vm'),
    ComponentMocker = Npm.require('component-mocker'),
    jasmineRequire = Npm.require('jasmine-core/lib/jasmine-core/jasmine.js')


Jasmine = Jasmine || {}
// Need to bring it on the global scope manually
// because this package has `debugOnly: true`
global.Jasmine = Jasmine
_.extend(Jasmine, {
  _registeredOnTestCallbacks: [],

  onTest: function (callback) {
    this._registeredOnTestCallbacks.push(callback)
  },

  _runOnTestCallbacks: function () {
    _.forEach(this._registeredOnTestCallbacks, function (callback) {
      callback()
    })
  }
})

ServerIntegrationTestFramework = function (options) {
  options = options || {}

  _.defaults(options, {
    name: 'jasmine-server-integration',
    regex: '^tests/jasmine/server/integration/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
    sampleTestGenerator: function () {
      return [
        {
          path: 'jasmine/server/integration/sample/spec/PlayerSpec.js',
          contents: Assets.getText('server/integration/sample-tests/sample/spec/PlayerSpec.js')
        },
        {
          path: 'jasmine/server/integration/sample/spec/SpecMatchers.js',
          contents: Assets.getText('server/integration/sample-tests/sample/spec/SpecMatchers.js')
        },
        {
          path: 'jasmine/server/integration/sample/src/Player.js',
          contents: Assets.getText('server/integration/sample-tests/sample/src/Player.js')
        },
        {
          path: 'jasmine/server/integration/sample/src/Song.js',
          contents: Assets.getText('server/integration/sample-tests/sample/src/Song.js')
        }
      ]
    },
    jasmineRequire: jasmineRequire
  })

  JasmineTestFramework.call(this, options)
}

ServerIntegrationTestFramework.prototype = Object.create(JasmineTestFramework.prototype)

_.extend(ServerIntegrationTestFramework.prototype, {

  startMirror: function () {
    var mirrorOptions = {
      port: this._getCustomPort(),
      testsPath: 'jasmine/server/integration'
    }

    if (process.env.JASMINE_SERVER_MIRROR_APP_PATH) {
      mirrorOptions.args = [
        '--test-app-path', process.env.JASMINE_SERVER_MIRROR_APP_PATH
      ]
    }

    var mirrorStarter = new MirrorStarter(this.name)
    mirrorStarter.lazyStartMirror(mirrorOptions)
  },

  _getCustomPort: function () {
    var customPort = parseInt(process.env.JASMINE_SERVER_MIRROR_PORT, 10)
    if (!_.isNaN(customPort)) {
      return customPort
    }
  },

  start: function () {
    var self = this;

    log.debug('Starting Server Integration mode')
    this._connectToMainApp()

    var runServerIntegrationTests = _.once(function () {
      serverIntegrationMirrorObserver.stop();
      self.runTests();
    });

    var VelocityMirrors = new Meteor.Collection(
      'velocityMirrors',
      {connection: this.ddpParentConnection}
    );
    this.ddpParentConnection.subscribe('VelocityMirrors');

    var serverIntegrationMirrorObserver = VelocityMirrors.find({
      framework: frameworks.serverIntegration.name,
      state: 'ready'
    }).observe({
      added: runServerIntegrationTests,
      changed: runServerIntegrationTests
    });
  },

  runTests: function () {
    log.debug('Running Server Integration test mode')

    this.ddpParentConnection.call('velocity/reports/reset', {framework: this.name})

    var jasmine = this.jasmineRequire.core(this.jasmineRequire)
    var env = jasmine.getEnv({
      setTimeout: Meteor.setTimeout.bind(Meteor),
      clearTimeout: Meteor.clearTimeout.bind(Meteor)
    })
    var jasmineInterface = new JasmineInterface({jasmine: jasmine})

    _.extend(global, {
      MeteorStubs: MeteorStubs,
      ComponentMocker: ComponentMocker
    })

    _.extend(global, jasmineInterface)

    // Load mock helper
    runCodeInContext(Assets.getText('lib/mock.js'), null)

    // Load specs
    Jasmine._runOnTestCallbacks()

    var velocityReporter = new VelocityTestReporter({
      mode: "Server Integration",
      framework: this.name,
      env: env,
      onComplete: this._reportCompleted.bind(this),
      timer: new jasmine.Timer(),
      ddpParentConnection: this.ddpParentConnection
    })

    env.addReporter(velocityReporter)
    env.execute()
  },

  _connectToMainApp: function () {
    if (!this.ddpParentConnection) {
      log.debug('Connect to parent app "' + process.env.PARENT_URL + '" via DDP')
      this.ddpParentConnection = DDP.connect(process.env.PARENT_URL)
    }
  },

  _reportCompleted: function () {
    this.ddpParentConnection.call('velocity/reports/completed', {framework: this.name})
  }
})
