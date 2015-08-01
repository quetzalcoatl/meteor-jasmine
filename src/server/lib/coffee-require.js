/* globals coffeeRequire: true */

// coffeeRequire
var fs = Npm.require('fs'),
    readFile = Meteor.wrapAsync(fs.readFile),
    path = Npm.require('path')

// The coffee-script compiler overrides Error.prepareStackTrace, mostly for the
// use of coffee.run which we don't use.  This conflicts with the tool's use of
// Error.prepareStackTrace to properly show error messages in linked code.  Save
// the tool's one and restore it after coffee-script clobbers it.
var prepareStackTrace = Error.prepareStackTrace;
var coffee = Npm.require('coffee-script');
Error.prepareStackTrace = prepareStackTrace;

/**
 * A coffee processor that can add source maps to compiled files
 *
 * This is a modified version of https://github.com/karma-runner/karma-coffee-preprocessor
 *
 * @method coffeePreprocessor
 * @param {Object} options to pass directly to the coffee-script compiler. See here
 */
var coffeePreprocessor = function (options, content, file, done) {
  var result = null
  var map
  var dataUri

  // Clone the options because coffee.compile mutates them
  var opts = _.clone(options)

  if (coffee.helpers.isLiterate(file.originalPath)) {
    opts.literate = true;
  }

  try {
    result = coffee.compile(content, opts)
  } catch (e) {
    /* jshint camelcase: false */
    console.log('%s\n  at %s:%d', e.message, file.originalPath, e.location.first_line)
    /* jshint camelcase: true */
    return done(e, null)
  }

  if (result.v3SourceMap) {
    map = JSON.parse(result.v3SourceMap)
    map.sources[0] = path.basename(file.originalPath)
    map.sourcesContent = [content]
    map.file = path.basename(file.originalPath.replace(/\.(coffee|litcoffee|coffee\.md)$/, '.js'))
    file.sourceMap = map
    dataUri = 'data:application/json;charset=utf-8;base64,' + new Buffer(JSON.stringify(map)).toString('base64')
    done(null, result.js + '\n//@ sourceMappingURL=' + dataUri + '\n')
  } else {
    done(null, result.js || result)
  }
}

/**
 * Load and execute a coffeescript file.
 *
 * @method coffeeRequire
 * @param {String} target Path to coffeescript file to load.
 * @param {Object} context the context to run the CoffeeScript code within.
 */
coffeeRequire = function (target, context) {
  var file = {originalPath: target},
      code = readFile(target, {encoding: 'utf8'})

  coffeePreprocessor({
    bare: true,
    sourceMap: false
  }, code, file, function (err, code) {
    if (!err) {
      runCodeInContext(code, context, target)
    } else {
      log.error(err)
    }
  })
}
