/* globals ServerUnitTestFramework: true */

var path = Npm.require('path'),
    fs = Npm.require('fs'),
    vm = Npm.require('vm'),
    Future = Npm.require(path.join('fibers', 'future')),
    ComponentMocker = Npm.require('component-mocker'),
    jasmineRequire = Npm.require('jasmine-core/lib/jasmine-core/jasmine.js')

ServerUnitTestFramework = function (options) {
  options = options || {}

  _.defaults(options, {
    name: 'jasmine-server-unit',
    regex: '^tests/jasmine/server/unit/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
    sampleTestGenerator: function () {
      return [
        {
          path: 'jasmine/server/unit/sample/spec/PlayerSpec.js',
          contents: Assets.getText('src/server/unit/sample-tests/sample/spec/PlayerSpec.js')
        },
        {
          path: 'jasmine/server/unit/sample/spec/SpecMatchers.js',
          contents: Assets.getText('src/server/unit/sample-tests/sample/spec/SpecMatchers.js')
        },
        {
          path: 'jasmine/server/unit/sample/src/Player.js',
          contents: Assets.getText('src/server/unit/sample-tests/sample/src/Player.js')
        },
        {
          path: 'jasmine/server/unit/sample/src/Song.js',
          contents: Assets.getText('src/server/unit/sample-tests/sample/src/Song.js')
        }
      ]
    },
    //regex: 'jasmine/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
    jasmineRequire: jasmineRequire
  })

  JasmineTestFramework.call(this, options)
}

ServerUnitTestFramework.prototype = Object.create(JasmineTestFramework.prototype)

_.extend(ServerUnitTestFramework.prototype, {

  _getTestFilesCursor: function () {
    return VelocityTestFiles.find({
      targetFramework: this.name,
      relativePath: {
        $nin: [
          'tests/jasmine/server/unit/packageMocksSpec.js',
          'tests/jasmine/server/unit/package-stubs.js'
        ]
      }
    })
  },

  start: function () {
    var testFilesCursor = this._getTestFilesCursor()

    var _runTests  = _.debounce(Meteor.bindEnvironment(this.runTests.bind(this),
      '[JasmineTestFramework.start.runTests]'), 200)

    this._observer = testFilesCursor.observe({
      added: _runTests,
      changed: _runTests,
      removed: _runTests
    });

    // Always run tests at least once.
    // The CI runner needs a completed event.
    _runTests()
  },

  runTests: function executeSpecsUnitMode() {
    Meteor.call('velocity/reports/reset', {framework: this.name})

    if (this._getTestFilesCursor().count() === 0) {
      this._reportCompleted()
      return
    }

    MockGenerator.generateMocks()

    var jasmine = this.jasmineRequire.core(this.jasmineRequire)
    var jasmineInterface = new JasmineInterface({jasmine: jasmine})

    var testFilePath = path.join(Velocity.getTestsPath(), 'jasmine', 'server', 'unit')

    var globalContext = {
      process: process,
      console: console,
      Buffer: Buffer,
      Npm: Npm,
      MeteorStubs: MeteorStubs,
      ComponentMocker: ComponentMocker,
      // Private state data that only we use
      __jasmine: {
        Meteor: {
          settings: Meteor.settings
        }
      }
    }

    var getAsset = function (assetPath, encoding, callback) {
      var fut;
      if (! callback) {
        fut = new Future();
        callback = fut.resolver();
      }
      var _callback = Package.meteor.Meteor.bindEnvironment(function (err, result) {
        if (result && ! encoding) {
          // Sadly, this copies in Node 0.10.
          result = new Uint8Array(result);
        }
        callback(err, result);
      }, function (e) {
        console.log('Exception in callback of getAsset', e.stack);
      });

      var filePath = path.join(Velocity.getAppPath(), 'private', assetPath);
      fs.readFile(filePath, encoding, _callback);
      if (fut) {
        return fut.wait();
      }
    };

    globalContext.__jasmine.Assets = {
      getText: function (assetPath, callback) {
        return getAsset(assetPath, 'utf8', callback);
      },
      getBinary: function (assetPath, callback) {
        return getAsset(assetPath, undefined, callback);
      }
    };

    // Add all available packages that should be included
    packagesToIncludeInUnitTests.forEach(function (packageName) {
      var packageGlobals = Package[packageName]
      if (packageGlobals) {
        _.forEach(packageGlobals, function (packageGlobal, packageGlobalName) {
          if (!globalContext[packageGlobalName]) {
            globalContext[packageGlobalName] = packageGlobal
          }
        })
      }
    })

    globalContext.global = globalContext
    _.extend(globalContext, jasmineInterface)

    // Need to install Meteor here so the app code files don't throw an error
    // when loaded
    MeteorStubs.install(globalContext)

    globalContext.Meteor.isServer = true
    globalContext.Meteor.isClient = false
    globalContext.Meteor.settings = Meteor.settings
    globalContext.Meteor.npmRequire = Meteor.npmRequire
    globalContext.Assets = globalContext.__jasmine.Assets

    var context = vm.createContext(globalContext)

    // Load mock helper
    runCodeInContext(
      Assets.getText('src/lib/mock.js'),
      context
    )

    // load stubs
    try {
      mockLoader.loadUserMocks(context)
    }
    catch (ex) {
      console.log('Error loading stubs', ex.message, ex.stack)
    }

    // load Meteor app source files prior to running tests
    try {
      fileLoader.loadFiles(context, {ignoreDirs: ['client']})
    }
    catch (ex) {
      console.log('Error loading app files', ex.message, ex.stack)
    }

    // load MeteorStubs before and after each test
    runCodeInContext(
      Assets.getText('src/server/lib/contextSpec.js'),
      context
    )

    // Load specs
    var specs = getSpecFiles(testFilePath)
    for (var i = 0; i < specs.length; i++) {
      fileLoader.loadFile(specs[i], context)
    }

    var env = jasmine.getEnv()

    var velocityReporter = new VelocityTestReporter({
      mode: 'Server Unit',
      framework: this.name,
      env: env,
      onComplete: this._reportCompleted.bind(this),
      timer: new jasmine.Timer()
    })

    env.addReporter(velocityReporter)
    env.execute()
  },

  _reportCompleted: function () {
    Meteor.call('velocity/reports/completed', {framework: this.name})
  }
})
