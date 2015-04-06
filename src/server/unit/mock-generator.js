/* globals MockGenerator: true */

// goal: write all package metadata to file so we can create
// the package mocks when running out-of-context
//
// Used to mock packages for the server unit test runner

var ComponentMocker = Npm.require('component-mocker'),
    fs = Npm.require('fs'),
    path = Npm.require('path'),
    mkdirp = Npm.require('mkdirp'),
    writeFile = Meteor.wrapAsync(fs.writeFile),
    packageMetadata = {}

function shouldIgnorePackage (packageName) {
  var packagesToIgnore = [
    'meteor',
    'minifiers',
    // Collides with expect of Jasmine
    'spacejamio:chai',
    'practicalmeteor:chai'
  ]
    .concat(getEnvironmentIgnoredPackages())
    .concat(packagesToIncludeInUnitTests)

  return _.contains(packagesToIgnore, packageName)
}

function getEnvironmentIgnoredPackages() {
  var packagesToIgnore = process.env.JASMINE_IGNORE_PACKAGES
  if (packagesToIgnore) {
    return packagesToIgnore.split(',').map(function (packageName) {
      return packageName.trim()
    });
  } else {
    return []
  }
}

function shouldIgnoreExport (exportName) {
  var exportsToIgnore = ['MongoInternals']

  return _.contains(exportsToIgnore, exportName)
}

MockGenerator = {
  // Mocks should only be generated once per app run
  // because the app restarts when a server file has changed.
  generateMocks: _.once(function () {

    /*
     Package = {
     "meteor": {
     "Meteor": {
     // ...
     }
     }
     "roles": {
     "Roles": {...}
     },
     "iron-router": {
     "Router": {...}
     }
     }
     */

    _.forEach(Package, function (packageObj, name) {
      if (!shouldIgnorePackage(name)) {
        var packageExports = {}

        _.forEach(packageObj, function (packageExportObj, packageExportName) {
          if (!shouldIgnoreExport(packageExportName)) {
            try {
              packageExports[packageExportName] = ComponentMocker.getMetadata(packageExportObj)
            } catch (error) {
              console.error('Could not mock the export ' + packageExportName +
              ' of the package ' + name + '. Will continue anyway.')
            }
          }
        })

        packageMetadata[name] = packageExports
      }
    })

    // Initially load the global stubs for app code
    writeMetadataToFile(
      packageMetadata,
      Assets.getText('src/server/unit/package-stubs.js.tpl'),
      'tests/jasmine/server/unit/package-stubs.js'
    )

    // Mocks the globals after each tests
    writeMetadataToFile(
      packageMetadata,
      Assets.getText('src/server/unit/metadata-reader.js.tpl'),
      'tests/jasmine/server/unit/packageMocksSpec.js'
    )

    function writeMetadataToFile(metadata, template, destination) {
      var output = _.template(template, {
        METADATA: JSON.stringify(metadata, null, '  ')
      })

      var outputPath = path.join(MeteorFilesHelpers.getAppPath(), destination)
      mkdirp.sync(path.dirname(outputPath))
      writeFile(outputPath, output, {encoding: 'utf8'})
    }
  })
}
