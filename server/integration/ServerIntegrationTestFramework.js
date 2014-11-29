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

  start: function () {
    debug('Starting Server Integration mode')
    this._connectToMainApp()
    this.runTests()
  },

  runTests: function () {
    debug('Running Server Integration test mode')

    var jasmine = this.jasmineRequire.core(this.jasmineRequire)
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

    // TODO: Do we need it in this mode?
    //var consoleReporter = getJasmineConsoleReporter("tests/jasmine/server/unit/", false);
    var env = jasmine.getEnv()

    var velocityReporter = new VelocityTestReporter({
      mode: "Server Integration",
      framework: this.name,
      env: env,
      onComplete: this._reportCompleted.bind(this),
      timer: new jasmine.Timer(),
      ddpParentConnection: this.ddpParentConnection
    })

    //env.addReporter(consoleReporter)
    env.addReporter(velocityReporter)
    env.execute()
  },

  _connectToMainApp: function () {
    if (!this.ddpParentConnection) {
      debug('Connect to parent app "' + process.env.PARENT_URL + '" via DDP')
      this.ddpParentConnection = DDP.connect(process.env.PARENT_URL)
    }
  },

  _reportCompleted: function () {
    this.ddpParentConnection.call('velocity/reports/completed', {framework: this.name})
  },

  startMirror: function () {
    var requestMirror = this._requestMirror.bind(this)
    var serverIntegrationTestsCursor = VelocityTestFiles.find(
      {targetFramework: this.name}
    )

    if (serverIntegrationTestsCursor.count() > 0) {
      requestMirror()
    } else {
      // Needed for `meteor --test`
      Meteor.call('velocity/reports/completed', {framework: this.name})
      var clientIntegrationTestsObserver = serverIntegrationTestsCursor.observe({
        added: function () {
          clientIntegrationTestsObserver.stop()
          requestMirror()
        }
      })
    }
  },

  _requestMirror: _.once(function () {
    var options = {
      framework: this.name,
      mirrorId: this.name
    }

    var customPort = parseInt(process.env.JASMINE_SERVER_MIRROR_PORT, 10)
    if (_.isNumber(customPort)) {
      options.port = customPort
    } else {
      options.port = freeport()
    }

    // HACK: need to make sure after the proxy package adds the test files
    Meteor.setTimeout(function() {
      Meteor.call(
        'velocity/mirrors/request',
        options,
        function (error) {
          if (error) {
            logError(error)
          }
        }
      )
    }, 100)
  })
})
