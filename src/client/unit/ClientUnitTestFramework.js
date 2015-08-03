/* globals ClientUnitTestFramework: true, __meteor_runtime_config__: false */

ClientUnitTestFramework = function (options) {
  options = options || {}

  _.defaults(options, {
    name: 'jasmine-client-unit',
    regex: '^tests/jasmine/client/unit/.+\\.(js|coffee|litcoffee|coffee\\.md)$',
    sampleTestGenerator: function () {
      return [
        {
          path: 'jasmine/client/unit/sample/spec/PlayerSpec.js',
          contents: Assets.getText('src/client/unit/sample-tests/sample/spec/PlayerSpec.js')
        },
        {
          path: 'jasmine/client/unit/sample/spec/SpecMatchers.js',
          contents: Assets.getText('src/client/unit/sample-tests/sample/spec/SpecMatchers.js')
        },
        {
          path: 'jasmine/client/unit/sample/src/Player.js',
          contents: Assets.getText('src/client/unit/sample-tests/sample/src/Player.js')
        },
        {
          path: 'jasmine/client/unit/sample/src/Song.js',
          contents: Assets.getText('src/client/unit/sample-tests/sample/src/Song.js')
        }
      ]
    },
    jasmineRequire: null
  })

  this.userKarmaConfig = {}

  JasmineTestFramework.call(this, options)
}

ClientUnitTestFramework.prototype = Object.create(JasmineTestFramework.prototype)

_.extend(ClientUnitTestFramework.prototype, {

  start: function () {
    lazyStart(this.name, this.startKarma.bind(this))
  },

  startKarma: function () {
    var self = this
    Karma.start(self.name, this.getKarmaConfig())

    // Listen for SIGUSR2/SIGHUP, which signals that a client asset has changed.

    var meteorVersion = MeteorVersion.getSemanticVersion();
    var reloadSignal = (meteorVersion && PackageVersion.lessThan(meteorVersion, '1.0.4')) ?
      'SIGUSR2' :
      'SIGHUP'

    process.on(reloadSignal, Meteor.bindEnvironment(function () {
      // Wait a bit to get the updated file catalog
      Meteor.setTimeout(function () {
        log.debug('Client assets have changed. Updating Karma config file.')
        Karma.setConfig(self.name, self.getKarmaConfig())
      }, 100)
    }));
  },

  setUserKarmaConfig: function (config) {
    var blacklist = [
      'autoWatch', 'autoWatchBatchDelay',
      'basePath', 'browserDisconnectTimeout', 'browserDisconnectTolerance',
      'browserNoActivityTimeout', 'browsers', 'captureTimeout', 'client',
      'exclude', 'files', 'frameworks', 'hostname', 'port', 'proxies', 'singleRun',
      'urlRoot'
    ]
    this.userKarmaConfig = _.omit(config, blacklist)
    log.debug('User has changed Karma config. Updating Karma config file.')
    Karma.setConfig(this.name, this.getKarmaConfig())
  },

  getKarmaConfig: function () {
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
      'Firefox': 'karma-firefox-launcher',
      'PhantomJS': 'karma-phantomjs-launcher',
      'SauceLabs': 'karma-sauce-launcher'
    }

    var browser = process.env.JASMINE_BROWSER || 'Chrome';
    var launcherPlugin = launcherPlugins[browser];

    /* jshint camelcase: false */
    var startOptions = _.extend({}, this.userKarmaConfig, {
      port: 9876,
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
        args: [_.defaults({
          // Make those values constant to avoid unnecessary Karma restarts
          autoupdateVersion: 'unknown',
          autoupdateVersionRefreshable: 'unknown',
          autoupdateVersionCordova: 'none'

        }, __meteor_runtime_config__)]
      },
      browserDisconnectTimeout: 10000,
      browserNoActivityTimeout: 15000,

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
    })
    /* jshint camelcase: true */

    if (this.userKarmaConfig.plugins) {
      startOptions.plugins = startOptions.plugins.concat(this.userKarmaConfig.plugins)
    }

    if (this.userKarmaConfig.preprocessors) {
      _.extend(startOptions.preprocessors, this.userKarmaConfig.preprocessors)
    }

    return startOptions
  },

  _getPreAppFiles: function () {
    return [
      this._getAssetPath('src/client/unit/assets/__meteor_runtime_config__.js')
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
          'packages/velocity_html-reporter.js'
        ]
        return !_.contains(ignoredFiles, file.path)
      })
      .map(function (file) {
        var mockedFiles = [
          'packages/autoupdate.js',
          'packages/reload.js',
          'packages/meteorhacks_fast-render.js'
        ]

        if (_.contains(mockedFiles, file.path)) {
          return this._getAssetPath('src/client/unit/assets/mocks/' + file.path)
        } else {
          return {
            pattern: '.meteor/local/build/programs/web.browser/' + file.path,
            nocache: true
          }
        }
      }, this)
      .value()
  },

  _getCssFiles: function () {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.type === 'css'
      })
      .map(function (file) {
        return {
          pattern: '.meteor/local/build/programs/web.browser/' + file.path,
          nocache: true
        }
      })
      .value()
  },

  _getAppFiles: function () {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.type === 'js' && file.path.indexOf('packages/') !== 0
      })
      .map(function (file) {
        return {
          pattern: '.meteor/local/build/programs/web.browser/' + file.path,
          nocache: true
        }
      })
      .value()
  },

  _getHelperFiles: function () {
    return [
      this._getAssetPath('src/client/unit/assets/jasmine-jquery.js'),
      this._getAssetPath('.npm/package/node_modules/component-mocker/index.js'),
      this._getAssetPath('src/lib/mock.js'),
      this._getAssetPath('src/lib/VelocityTestReporter.js'),
      this._getAssetPath('src/client/unit/assets/adapter.js'),
      '.meteor/local/build/programs/server/assets/packages/velocity_meteor-stubs/index.js',
      this._getAssetPath('src/client/unit/assets/helpers/iron_router.js')
    ]
  },

  _getStubFiles: function () {
    return [
      'tests/jasmine/client/unit/**/*-+(stub|stubs|mock|mocks).+(js|coffee|litcoffee|coffee.md)'
    ]
  },

  _getTestFiles: function () {
    // Use a match pattern directly.
    // That allows Karma to detect changes and rerun the tests.
    return [
      'tests/jasmine/client/unit/**/*.+(js|coffee|litcoffee|coffee.md)'
    ]
  },

  _getAssetPath: function (fileName) {
    var assetsPath = '.meteor/local/build/programs/server/assets/packages/sanjo_jasmine/'
    return assetsPath + fileName;
  }
});
