/* jshint camelcase: false */
/* global
   Package: false
 */

Package.describe({
  name: 'sanjo:jasmine',
  summary: 'Easily use Jasmine in Meteor',
  version: '0.6.5',
  git: 'https://github.com/Sanjo/meteor-jasmine.git',
  debugOnly: true
})

Npm.depends({
  'jasmine-core': '2.0.0',
  'component-mocker': '0.2.0',
  'mkdirp': '0.5.0',
  'glob': '3.2.9',
  'rimraf': '2.2.8',
  'coffee-script': '1.7.1',
  'traceur': '0.0.66',
  'freeport': '1.0.3'
})

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use([
    'underscore',
    'tracker'
  ], ['server', 'client'])
  api.use([
    'velocity:core@1.0.0-rc.6',
    'velocity:meteor-stubs@1.0.0',
    'alanning:package-stubber@0.0.9',
    'sanjo:karma@0.12.24_2',
    'sanjo:karma-jasmine@0.2.3',
    'sanjo:karma-chrome-launcher@0.1.5_1',
    'sanjo:karma-coffee-preprocessor@0.2.1'
  ], 'server')
  api.use([
    'velocity:node-soft-mirror@0.0.2',
  ], ['server', 'client'], {unordered: true})
  api.use([
    'velocity:shim@0.0.3',
  ], ['server', 'client'])

  api.addFiles([
    'lib/meteor.js'
  ], 'server')

  api.addFiles([
    'lib/logHelpers.js',
    'lib/JasmineTestFramework.js',
    'lib/JasmineInterface.js',
    'lib/VelocityTestReporter.js'
  ], ['server', 'client'])

  // ----------------------------------------
  // Files that are needed in the mirror
  // ----------------------------------------

  // Client side integration testing
  api.addFiles([
    '.npm/package/node_modules/component-mocker/index.js',
    '.npm/package/node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
    '.npm/package/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
    'client/integration/ClientIntegrationTestFramework.js',
    'client/integration/clientsideSetup.js',
    'lib/mock.js'
  ], 'client')

  api.addFiles([
    // set up server-side Meteor methods
    'client/integration/mirrorStarter.js',
    'server/lib/mirror-info.js'
  ], 'server')

  // ----------------------------------------
  // Files that are needed in the main app
  // ----------------------------------------

  api.addFiles([
    'server/lib/runFileInContext.js',
    'server/lib/coffee-require.js',
    'server/lib/jsHarmony-require.js',
    'server/lib/file-loader.js',
    'server/lib/html-scanner.js',
    'server/lib/load-order-sort.js',
    'server/lib/stub-loader.js',

    'server/unit/included-packages.js',
    'server/unit/mock-generator.js',
    'server/unit/ServerUnitTestFramework.js',
    'client/unit/ClientUnitTestFramework.js',
    'client/integration/ClientIntegrationTestFramework.js',

    'server/lib/get-files.js',
    'registerFrameworks.js'
  ], 'server')

  // ----------------------------------------
  // Assets
  // ----------------------------------------

  api.addFiles([
    // Sample tests
    'client/integration/sample-tests/sample/spec/PlayerSpec.js',
    'client/integration/sample-tests/sample/spec/SpecMatchers.js',
    'client/integration/sample-tests/sample/src/Player.js',
    'client/integration/sample-tests/sample/src/Song.js',
    'client/unit/sample-tests/sample/spec/PlayerSpec.js',
    'client/unit/sample-tests/sample/spec/SpecMatchers.js',
    'client/unit/sample-tests/sample/src/Player.js',
    'client/unit/sample-tests/sample/src/Song.js',
    'server/unit/sample-tests/sample/spec/PlayerSpec.js',
    'server/unit/sample-tests/sample/spec/SpecMatchers.js',
    'server/unit/sample-tests/sample/src/Player.js',
    'server/unit/sample-tests/sample/src/Song.js',
    // Other
    'server/unit/package-stubs.js.tpl',
    'server/unit/metadata-reader.js.tpl',
    'lib/mock.js',
    'server/lib/contextSpec.js',
    'lib/VelocityTestReporter.js',
    'client/unit/assets/__meteor_runtime_config__.js',
    'client/unit/assets/adapter.js',
    'client/unit/assets/jasmine-jquery.js'
  ], 'server', {isAsset: true})

})

Package.onTest(function(api){
  api.use(['spacejamio:munit']);
  api.addFiles(['specs/example.js'], ['client', 'server'])
})
