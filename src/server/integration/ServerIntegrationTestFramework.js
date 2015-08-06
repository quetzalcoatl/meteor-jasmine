/* globals Jasmine: true, ServerIntegrationTestFramework: true */

/**
 * Design:
 * - Let Meteor load the tests
 * - Let Meteor restart the mirror when a file changed.
 *   This implicates only one test run per mirror run.
 */

var ComponentMocker = Npm.require('component-mocker');
var jasmineRequire = Npm.require('jasmine-core/lib/jasmine-core/jasmine.js');

var showOnTestDeprecationInfo = _.once(function () {
  log.info('You no longer need to wrap your server integration tests in Jasmine.onTest ;-)')
});

Meteor.methods({
  'jasmine/showOnTestDeprecationInfo': function () {
    showOnTestDeprecationInfo()
  }
})

var registeredOnTestCallbacks = [];

var onTest = function (func) {
  registeredOnTestCallbacks.push(func)
}

// Flag for deprecation message
var wasJasmineOnTestCalled = false;

Jasmine = Jasmine || {}
// Need to bring it on the global scope manually
// because this package has `debugOnly: true`
global.Jasmine = Jasmine
_.extend(Jasmine, {
  // Deprecated
  // You no longer need to wrap your tests in Jasmine.onTest.
  onTest: function (func) {
    onTest(func);
    wasJasmineOnTestCalled = true;
  }
})


// Postpone the execution of the test blocks until we run the tests.
// This makes sure that the whole app is loaded before.
var jasmineGlobals = [
  'describe',
  'xdescribe',
  'fdescribe',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll'
]

jasmineGlobals.forEach(function (jasmineGlobal) {
  global[jasmineGlobal] = executeOnTestFactory(jasmineGlobal)
})

function executeOnTestFactory(funcName) {
  return function (/* arguments */) {
    var args = arguments
    onTest(function () {
      global[funcName].apply(global, args)
    })
  }
}


ServerIntegrationTestFramework = function (options) {
  options = options || {}

  _.defaults(options, {
    name: 'jasmine-server-integration',
    regex: '^tests/jasmine/server/integration/.+\\.(js|es6|jsx|coffee|litcoffee|coffee\\.md)$',
    sampleTestGenerator: function () {
      return [
        {
          path: 'jasmine/server/integration/sample/spec/PlayerSpec.js',
          contents: Assets.getText('src/server/integration/sample-tests/sample/spec/PlayerSpec.js')
        },
        {
          path: 'jasmine/server/integration/sample/spec/SpecMatchers.js',
          contents: Assets.getText('src/server/integration/sample-tests/sample/spec/SpecMatchers.js')
        },
        {
          path: 'jasmine/server/integration/sample/src/Player.js',
          contents: Assets.getText('src/server/integration/sample-tests/sample/src/Player.js')
        },
        {
          path: 'jasmine/server/integration/sample/src/Song.js',
          contents: Assets.getText('src/server/integration/sample-tests/sample/src/Song.js')
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

  setupEnvironment: function () {
    var self = this

    self.jasmine = self.jasmineRequire.core(self.jasmineRequire)
    self.env = self.jasmine.getEnv({
      setTimeout: Meteor.setTimeout.bind(Meteor),
      clearTimeout: Meteor.clearTimeout.bind(Meteor)
    })
    var jasmineInterface = new JasmineInterface({jasmine: self.jasmine})

    _.extend(global, {
      MeteorStubs: MeteorStubs,
      ComponentMocker: ComponentMocker
    })

    _.extend(global, jasmineInterface)

    // Load mock helper
    runCodeInContext(Assets.getText('src/lib/mock.js'), null)
  },

  start: function () {
    var self = this;

    log.debug('Starting Server Integration mode')

    this._connectToMainApp()

    if (isTestPackagesMode()) {
      self.runTests();
    } else {
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
        framework: self.name,
        state: 'ready'
      }).observe({
        added: runServerIntegrationTests,
        changed: runServerIntegrationTests
      });
    }
  },

  runTests: function () {
    var self = this

    log.debug('Running Server Integration test mode')

    this.ddpParentConnection.call('velocity/reports/reset', {framework: self.name})

    frameworks.serverIntegration.setupEnvironment()

    // Load specs that were wrapped with Jasmine.onTest
    self._runOnTestCallbacks()

    var velocityReporter = new VelocityTestReporter({
      mode: 'Server Integration',
      framework: self.name,
      env: self.env,
      onComplete: self._reportCompleted.bind(self),
      timer: new self.jasmine.Timer(),
      ddpParentConnection: self.ddpParentConnection,
      isServer: true
    })

    self.env.addReporter(velocityReporter)
    self.env.execute()
  },

  _runOnTestCallbacks: function () {
    var self = this

    if (wasJasmineOnTestCalled) {
      self.ddpParentConnection.call('jasmine/showOnTestDeprecationInfo')
    }

    _.forEach(registeredOnTestCallbacks, function (callback) {
      callback()
    })
  },

  _connectToMainApp: function () {
    if (!this.ddpParentConnection) {
      if (isTestPackagesMode()) {
        this.ddpParentConnection = Meteor
      } else {
        log.debug('Connect to parent app "' + process.env.PARENT_URL + '" via DDP')
        this.ddpParentConnection = DDP.connect(process.env.PARENT_URL)
      }
    }
  },

  _reportCompleted: function () {
    this.ddpParentConnection.call('velocity/reports/completed', {framework: this.name})
  }
})
