var path = Npm.require('path')

ClientUnitTestFramework = function (options) {
  options = options || {}

  _.defaults(options, {
    name: 'jasmine-client-unit',
    regex: '^tests/jasmine/client/unit/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
    sampleTestGenerator: function () {
      return [
        {
          path: 'jasmine/client/unit/sample/spec/PlayerSpec.js',
          contents: Assets.getText('client/unit/sample-tests/sample/spec/PlayerSpec.js')
        },
        {
          path: 'jasmine/client/unit/sample/spec/SpecMatchers.js',
          contents: Assets.getText('client/unit/sample-tests/sample/spec/SpecMatchers.js')
        },
        {
          path: 'jasmine/client/unit/sample/src/Player.js',
          contents: Assets.getText('client/unit/sample-tests/sample/src/Player.js')
        },
        {
          path: 'jasmine/client/unit/sample/src/Song.js',
          contents: Assets.getText('client/unit/sample-tests/sample/src/Song.js')
        }
      ]
    },
    jasmineRequire: null
  })

  JasmineTestFramework.call(this, options)
}

ClientUnitTestFramework.prototype = Object.create(JasmineTestFramework.prototype)

_.extend(ClientUnitTestFramework.prototype, {
  start: function () {
    var files = this._getPreAppFiles().concat(
      this._getPackageFiles(),
      this._getHelperFiles(),
      this._getStubFiles(),
      this._getCssFiles(),
      this._getAppFiles(),
      this._getTestFiles()
    )

    var launcherPlugins = {
      'Chrome': 'karma-chrome-launcher',
      'ChromeCanary': 'karma-chrome-launcher',
      'PhantomJS': 'karma-phantomjs-launcher-nonet'
    }

    var browser = process.env.JASMINE_BROWSER || 'Chrome';
    var launcherPlugin = launcherPlugins[browser];

    var startOptions = {
      port: freeport(),
      basePath: Velocity.getAppPath(),
      frameworks: ['jasmine'],
      browsers: [browser],
      plugins: [
        'karma-jasmine',
        launcherPlugin,
        'karma-coffee-preprocessor'
      ],
      files: files,
      client: {
        args: [__meteor_runtime_config__]
      },
      browserDisconnectTimeout: 10000,
      browserNoActivityTimeout: 15000,
      singleRun: !!process.env.JASMINE_SINGLE_RUN,

      preprocessors: {
        '**/*.{coffee,litcoffee,coffee.md}': ['coffee']
      },

      coffeePreprocessor: {
        options: {
          bare: true,
          sourceMap: true
        },
        transformPath: function (path) {
          return path.replace(/\.(coffee|litcoffee|coffee\\.md)$/, '.js');
        }
      }
    }

    if (browser === 'PhantomJS') {
      startOptions.phantomjsLauncher = {
        // configure PhantomJS executable for each platform
        cmd: {
          linux: path.join(Velocity.getAppPath(), '.meteor/local/build/programs/server/node_modules/.bin/phantomjs'),
          darwin: path.join(Velocity.getAppPath(), '.meteor/local/build/programs/server/node_modules/.bin/phantomjs'),
          // TODO: Make sure that this path is correct when Meteor supports Windows
          win32: path.join(Velocity.getAppPath(), '.meteor/local/build/programs/server/node_modules/.bin/phantomjs')
        }
      }
    }

    Karma.start('jasmine', startOptions)
  },
  _getPreAppFiles: function () {
    return [
      this._getAssetPath('client/unit/assets/__meteor_runtime_config__.js')
    ]
  },
  _getPackageFiles: function () {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.type === 'js' && file.path.indexOf('packages/') === 0
      })
      .filter(function (file) {
        var ignoredFiles = [
          'packages/sanjo_jasmine.js',
          'packages/velocity_core.js',
          'packages/velocity_test-proxy.js',
          'packages/velocity_html-reporter.js',
        ]
        return !_.contains(ignoredFiles, file.path)
      })
      .map(function (file) {
        return '.meteor/local/build/programs/web.browser/' + file.path
      })
      .value()
  },
  _getCssFiles: function () {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.type === 'css'
      })
      .map(function (file) {
        return '.meteor/local/build/programs/web.browser/' + file.path
      })
      .value()
  },
  _getAppFiles: function () {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.type === 'js' && file.path.indexOf('packages/') !== 0
      })
      .map(function (file) {
        return '.meteor/local/build/programs/web.browser/' + file.path
      })
      .value()
  },
  _getHelperFiles: function () {
    return [
      this._getAssetPath('client/unit/assets/jasmine-jquery.js'),
      this._getAssetPath('.npm/package/node_modules/component-mocker/index.js'),
      this._getAssetPath('lib/mock.js'),
      this._getAssetPath('lib/VelocityTestReporter.js'),
      this._getAssetPath('client/unit/assets/adapter.js')
    ]
  },
  _getStubFiles: function () {
    return [
      'tests/jasmine/client/unit/**/*-{stub,stubs,mock,mocks}.{js,coffee,litcoffee,coffee.md}'
    ]
  },
  _getTestFiles: function () {
    // Use a match pattern directly.
    // That allows Karma to detect changes and rerun the tests.
    return [
      'tests/jasmine/client/unit/**/*.{js,coffee,litcoffee,coffee.md}'
    ]
  },
  _getAssetPath: function (fileName) {
    var assetsPath = '.meteor/local/build/programs/server/assets/packages/sanjo_jasmine/'
    return assetsPath + fileName;
  },
  generateKarmaConfig: function () {
    var karmaConfTemplate = Assets.getText('client/unit/karma.conf.js.tpl')
    var karmaConf = _.template(karmaConfTemplate, {
      DATE: new Date().toISOString(),
      BASE_PATH: '../../../../',
      FRAMEWORKS: "'jasmine'",
      FILES: 'TODO', // TODO: Read and order app files. And also add tests with wildcard.
      EXCLUDE: 'TODO',
      PREPROCESSORS: 'TODO',
      AUTO_WATCH: 'false',
      BROWSERS: "'Chrome'"
    })
    // TODO: Write file
    // TODO: Allow user to overwrite template
    // TODO: Read default config from karma.json
  }
});
