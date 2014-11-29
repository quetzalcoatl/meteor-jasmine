/*jshint -W117 */
/* global
 */

// jsHarmonyRequire
var fs = Npm.require('fs'),
    path = Npm.require('path'),
    traceur = Npm.require('traceur')

/**
 * A js-next harmony processor that transpiles js6 harmony files to js
 *
 * @method jsHarmonyPreprocessor
 */
var jsHarmonyPreprocessor = function (content, file, done) {

  var traceurOptions = {
    sourceMaps: true
  }

  var result

  try {
    result = traceur.compile(content, traceurOptions)
  } catch (ex) {
    return done(ex.toString().replace(/(<compile-source>)/g, "\n$1"))
  }

  if (result.generatedSourceMap) {
    var map = JSON.parse(result.generatedSourceMap)
    map.sources[0] = path.basename(file.originalPath)
    map.sourcesContent = [content]
    map.file = path.basename(file.originalPath.replace(/\.next\.js$/, '.js'))
    file.sourceMap = map
    dataUri = 'data:application/json;charset=utf-8;base64,' + new Buffer(JSON.stringify(map)).toString('base64')
    done(null, result.js + '\n//@ sourceMappingURL=' + dataUri + '\n')
  } else {
    done(null, result.js || result)
  }
}

/**
 * Load and execute a javascript-next (ES6 harmony) file.
 *
 * @method jsHarmonyRequire
 * @param {String} target Path to javascript file to load.
 * @param {Object} context the context to run the Harmony code within.
 */
jsHarmonyRequire = function (target, context) {
  var file = {originalPath: target},
      code = fs.readFileSync(target).toString()

  jsHarmonyPreprocessor(code, file, function (err, code) {
    if (!err) {
      // I needed to add the runtime explicitly to context, since it does not exist there
      context.$traceurRuntime = $traceurRuntime
      runCodeInContext(code, context, target)
    } else {
      log.error(err)
    }
  })
}
