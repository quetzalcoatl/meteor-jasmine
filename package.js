/* jshint camelcase: false */
/* global
   Package: false
 */

Package.describe({
  name: 'sanjo:jasmine',
  summary: 'Easily use Jasmine in Meteor',
  version: '0.13.4',
  git: 'https://github.com/Sanjo/meteor-jasmine.git',
  debugOnly: true
})

Npm.depends({
  'jasmine-core': 'https://github.com/Sanjo/jasmine/archive/be80c78105b5309b42b9c39b6d535478ec4ac747.tar.gz',
  'component-mocker': '0.2.0',
  'mkdirp': '0.5.0',
  'glob': '5.0.3',
  'rimraf': '2.3.2',
  'coffee-script': '1.7.1',
  'freeport': '1.0.3'
})

Package.onUse(function (api) {
  api.export('Jasmine', 'server')

  api.versionsFrom('METEOR@1.1.0.2')

  api.use([
    'underscore',
    'tracker',
    'ddp',
    'practicalmeteor:loglevel@1.1.0_2',
    'velocity:core@0.6.2',
    'velocity:shim@0.1.0'
  ], ['server', 'client'])

  api.use([
    'velocity:meteor-stubs@1.0.3',
    'sanjo:karma@1.5.1',
    'sanjo:meteor-version@1.0.0',
    'package-version-parser',
    'sanjo:meteor-files-helpers@1.1.0_4'
  ], 'server')

  api.addFiles([
    '.npm/package/node_modules/component-mocker/index.js',
    '.npm/package/node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
    '.npm/package/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js'
  ], 'client')

  api.addFiles('src/lib/log.js', ['server', 'client'])

  api.addFiles([
    'src/lib/freeport.js',
    'src/lib/lazyStart.js',
    'src/lib/MirrorStarter.js'
  ], 'server')

  api.addFiles([
    'src/lib/JasmineTestFramework.js',
    'src/lib/JasmineInterface.js',
    'src/lib/VelocityTestReporter.js'
  ], ['server', 'client'])

  // ----------------------------------------
  // Files that are needed in the main app and the mirror
  // ----------------------------------------

  api.addFiles([
    'src/server/integration/ServerIntegrationTestFramework.js'
  ], 'server')

  // ----------------------------------------
  // Files that are needed in the mirror
  // ----------------------------------------

  // Client side integration testing
  api.addFiles([
    'src/client/integration/ClientIntegrationTestFramework.js',
    'src/client/integration/clientsideSetup.js',
    'src/lib/mock.js'
  ], 'client')

  api.addFiles([
    // set up server-side Meteor methods
    'src/server/lib/mirror-info.js'
  ], 'server')

  // ----------------------------------------
  // Files that are needed in the main app
  // ----------------------------------------

  api.addFiles([
    'src/server/lib/runFileInContext.js',
    'src/server/lib/coffee-require.js',
    'src/server/lib/file-loader.js',
    'src/server/lib/load-order-sort.js',
    'src/server/lib/mock-loader.js',

    'src/server/unit/included-packages.js',
    'src/server/unit/mock-generator.js',
    'src/server/unit/ServerUnitTestFramework.js',
    'src/client/unit/ClientUnitTestFramework.js',
    'src/client/integration/ClientIntegrationTestFramework.js',

    'src/server/lib/get-files.js',
    'src/registerFrameworks.js'
  ], 'server')

  // ----------------------------------------
  // Assets
  // ----------------------------------------

  api.addFiles([
    // Sample tests
    'src/client/integration/sample-tests/sample/spec/PlayerSpec.js',
    'src/client/integration/sample-tests/sample/spec/SpecMatchers.js',
    'src/client/integration/sample-tests/sample/src/Player.js',
    'src/client/integration/sample-tests/sample/src/Song.js',
    'src/client/unit/sample-tests/sample/spec/PlayerSpec.js',
    'src/client/unit/sample-tests/sample/spec/SpecMatchers.js',
    'src/client/unit/sample-tests/sample/src/Player.js',
    'src/client/unit/sample-tests/sample/src/Song.js',
    'src/server/integration/sample-tests/sample/spec/PlayerSpec.js',
    'src/server/integration/sample-tests/sample/spec/SpecMatchers.js',
    'src/server/integration/sample-tests/sample/src/Player.js',
    'src/server/integration/sample-tests/sample/src/Song.js',
    'src/server/unit/sample-tests/sample/spec/PlayerSpec.js',
    'src/server/unit/sample-tests/sample/spec/SpecMatchers.js',
    'src/server/unit/sample-tests/sample/src/Player.js',
    'src/server/unit/sample-tests/sample/src/Song.js',
    // Other
    '.npm/package/node_modules/component-mocker/index.js',
    'src/server/unit/package-stubs.js.tpl',
    'src/server/unit/metadata-reader.js.tpl',
    'src/lib/mock.js',
    'src/server/lib/contextSpec.js',
    'src/lib/VelocityTestReporter.js',
    'src/client/unit/assets/__meteor_runtime_config__.js',
    'src/client/unit/assets/adapter.js',
    'src/client/unit/assets/jasmine-jquery.js',
    'src/client/unit/assets/mocks/packages/autoupdate.js',
    'src/client/unit/assets/mocks/packages/reload.js',
    'src/client/unit/assets/mocks/packages/meteorhacks_fast-render.js'
  ], 'server', {isAsset: true})

})
