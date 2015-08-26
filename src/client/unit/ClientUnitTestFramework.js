/* globals ClientUnitTestFramework: true, __meteor_runtime_config__: false */

var path = Npm.require('path');
var fs = Npm.require('fs');
var mkdirp = Npm.require('mkdirp');

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

    log.debug('WebApp has been (re)started, starting Karma.');
    self._generateContextHtml();
    self._generateDebugHtml();
    Karma.start(self.name, this.getKarmaConfig())

    // Listen for message 'refresh:client' that signals incoming 'refreshable' autoupdate
    process.on('message', Meteor.bindEnvironment(function (m) {
      log.debug('client-refresh noticed, stopping Karma');
      if (m && m.refresh === 'client') {
        Karma.stop(self.name);

        // Listen for message 'on-listening' that signals that the application has been rebuild
        // and is ready to serve
        // * This callback *must* be registered here in 'on-message-refresh-client'
        // * because onListening is a short-lived registration that is removed after firing once
        WebApp.onListening(function () {
          log.debug('WebApp has been updated. Updating Karma config file and starting it up.');
          self._generateContextHtml();
          self._generateDebugHtml();
          Karma.restartWithConfig(self.name, self.getKarmaConfig());
        });
      }
    }));
  },

  _generateContextHtml: function () {
    this._generateKarmaHtml('context')
  },

  _generateDebugHtml: function () {
    this._generateKarmaHtml('debug')
  },

  _generateKarmaHtml: function (type) {
    var fileName = type + '.html'
    var htmlPath = this._getKarmaHtmlPath(type);
    mkdirp.sync(path.dirname(htmlPath))
    var headHtml = this._getHeadHtml() || ''
    var contextHtml = Assets.getText('src/client/unit/assets/' + fileName)
      .replace('%HEAD%', headHtml)
    fs.writeFileSync(htmlPath, contextHtml, {encoding: 'utf8'})
  },

  _getKarmaHtmlPath: function (type) {
    var fileName = type + '.html'
    var karmaConfigPath = path.dirname(Karma.getConfigPath(this.name))
    return path.join(karmaConfigPath, fileName)
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
    var files = [];
    var proxies = {};

    this._addPreAppFiles(files, proxies)
    this._addPackageFiles(files, proxies)
    this._addHelperFiles(files, proxies)
    this._addStubFiles(files, proxies)
    this._addAppFiles(files, proxies)
    this._addTestFiles(files, proxies)

    var launcherPlugins = {
      'Chrome': 'karma-chrome-launcher',
      'ChromeCanary': 'karma-chrome-launcher',
      'Firefox': 'karma-firefox-launcher',
      'PhantomJS': 'karma-phantomjs-launcher',
      'SauceLabs': 'karma-sauce-launcher'
    }

    var browser = process.env.JASMINE_BROWSER || 'Chrome';
    var launcherPlugin = launcherPlugins[browser];

    var basePath = Velocity.getAppPath()

    /* jshint camelcase: false */
    var startOptions = _.extend({}, this.userKarmaConfig, {
      port: 9876,
      basePath: basePath,
      frameworks: ['jasmine'],
      browsers: [browser],
      plugins: [
        'karma-jasmine',
        launcherPlugin,
        'karma-coffee-preprocessor'
      ],
      files: files,
      proxies: proxies,
      client: {
        contextFile: this._getKarmaHtmlPath('context'),
        debugFile: this._getKarmaHtmlPath('debug'),
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

  _addPreAppFiles: function (files) {
    files.push(
      this._getAssetPath('src/client/unit/assets/__meteor_runtime_config__.js')
    )
  },

  _addPackageFiles: function (files, proxies) {
    _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.path.indexOf('packages/') === 0
      })
      .filter(function (file) {
        var ignoredFiles = [
          'packages/sanjo_jasmine.js',
          'packages/velocity_html-reporter.js'
        ]
        return !_.contains(ignoredFiles, file.path)
      })
      .forEach(function (file) {
        var mockedFiles = [
          'packages/autoupdate.js',
          'packages/reload.js',
          'packages/meteorhacks_fast-render.js'
        ]

        if (_.contains(mockedFiles, file.path)) {
          files.push(this._getAssetPath('src/client/unit/assets/mocks/' + file.path))
        } else {
          this._addFile(file, files, proxies)
        }
      }, this)
      .value()
  },

  _addAppFiles: function (files, proxies) {
    return _.chain(WebApp.clientPrograms['web.browser'].manifest)
      .filter(function (file) {
        return file.path.indexOf('packages/') !== 0
      })
      .forEach(function (file) {
        this._addFile(file, files, proxies)
      }, this)
      .value()
  },

  _addFile: function (file, files, proxies) {
    var basePath = '.meteor/local/build/programs/web.browser/'
    files.push({
      pattern: basePath + file.path,
      watched: false,
      included: _.contains(['js', 'css'], file.type),
      served: true,
      nocache: false
    });

    if (file.type === 'asset') {
      proxies[file.url] = '/base/' + basePath + file.path
    }
  },

  _addHelperFiles: function (files) {
    files.push(
      this._getAssetPath('src/client/unit/assets/jasmine-jquery.js'),
      this._getAssetPath('.npm/package/node_modules/component-mocker/index.js'),
      this._getAssetPath('src/lib/mock.js'),
      this._getAssetPath('src/lib/VelocityTestReporter.js'),
      this._getAssetPath('src/client/unit/assets/adapter.js'),
      '.meteor/local/build/programs/server/assets/packages/velocity_meteor-stubs/index.js',
      this._getAssetPath('src/client/unit/assets/helpers/iron_router.js')
    )
  },

  _addStubFiles: function (files) {
    files.push(
      'tests/jasmine/client/unit/**/*-+(stub|stubs|mock|mocks).+(js|coffee|litcoffee|coffee.md)'
    )
  },

  _addTestFiles: function (files) {
    // Use a match pattern directly.
    // That allows Karma to detect changes and rerun the tests.
    files.push(
      'tests/jasmine/client/unit/**/*.+(js|coffee|litcoffee|coffee.md)'
    )
  },

  _getAssetPath: function (fileName) {
    var assetsPath = '.meteor/local/build/programs/server/assets/packages/sanjo_jasmine/'
    return assetsPath + fileName;
  },

  _getHeadHtml: function () {
    try {
      return fs.readFileSync(
        path.join(Velocity.getAppPath(), '.meteor/local/build/programs/web.browser/head.html'),
        {encoding: 'utf8'}
      );
    } catch (error) {
      return null;
    }
  }
});
