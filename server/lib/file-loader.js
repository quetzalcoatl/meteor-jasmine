var PWD = process.env.PWD,
    DEBUG = process.env.DEBUG,
    fs = Npm.require('fs'),
    path = Npm.require('path'),
    glob = Npm.require('glob')

fileLoader = {
  loadFiles: loadFiles,
  getJsFiles: getJsFiles,
  getCoffeeFiles: getCoffeeFiles,
  filterFiles: filterFiles,
  loadFile: loadFile
}

/**
 * Loads a Meteor app's javascript and coffeescript files.
 * Matches Meteor core's load order.
 *
 * Excluded directories: private, public, programs, packages, tests
 *
 * @method loadFiles
 * @param {Object} context Global context
 * @param {Object} [options]
 * @param {Array|String} [options.ignoreDirs] Directories to ignore
 */
function loadFiles (context, options) {
  var files = _.union(getJsFiles(options), getCoffeeFiles(options))

  files.sort(loadOrderSort([]))
  _.each(files, function (file) {
    loadFile(file, context)
  })
}

/**
 * Returns list of javascript filenames in Meteor app.
 *
 * Excluded directories: private, public, programs, packages, tests
 *
 * @method getJsFiles
 * @param {Object} [options]
 * @param {Array|String} [options.ignoreDirs] Directories to ignore
 * @return {Array.<String>} list of filenames
 */
function getJsFiles (options) {
  var files = glob.sync('**/*.js', { cwd: PWD })

  return filterFiles(files, options)
}

/**
 * Returns list of coffeescript files in Meteor app.
 *
 * Excluded directories: private, public, programs, packages, tests
 *
 * @method getCoffeeFiles
 * @param {Object} [options]
 * @param {Array|String} [options.ignoreDirs] Directories to ignore
 * @return {Array.<String>} list of filenames
 */
function getCoffeeFiles (options) {
  var files = glob.sync('**/*.{coffee,litcoffee,coffee.md}', { cwd: PWD })

  return filterFiles(files, options)
}

/**
 * Filters out any files in the following directories:
 *   private,
 *   public,
 *   programs,
 *   packages,
 *   tests
 *
 * @method filterFiles
 * @param {Array} files array of filenames to filter
 * @param {Object} [options]
 * @param {Array|String} [options.ignoreDirs] Directories to ignore
 * @return {Array} filenames
 */
function filterFiles (files, options) {
  var shouldIgnore = ['tests', 'private', 'public', 'programs', 'packages']

  options = options || {}

  if (options.ignoreDirs) {
    if ('string' === typeof options.ignoreDirs) {
      shouldIgnore.push(options.ignoreDirs)
    } else if (_.isArray(options.ignoreDirs)) {
      shouldIgnore = shouldIgnore.concat(options.ignoreDirs)
    }
  }

  return _.filter(files, function (filepath) {
    return !_.some(shouldIgnore, function (dirName) {
      var startPath = filepath.substring(0, dirName.length)
      return startPath === dirName
    })
  })
}

/**
 * Load and execute the target source file.
 * Will use node's 'require' if source file has a .js extension or
 * karma's coffeescript preprocessor if a .coffee/.litcoffee/.coffee.md extension
 *
 * @method loadFile
 * @param {String} target file path to load, relative to meteor app
 * @param {Object} context the context to load files within.
 *        If omitted the file will run in this context.
 */
function loadFile (target, context) {
  var pwd = process.env.PWD,
      filename = path.resolve(pwd, target),
      ext

  if (fs.existsSync(filename)) {
    ext = path.extname(filename)
    if (/\.next\.js$/.test(target)) {
      DEBUG && console.log('loading es6 source file:', filename)
      jsHarmonyRequire(filename, context)
    } else if ('.js' === ext) {
      DEBUG && console.log('loading source file:', filename)
      runFileInContext(filename, context)
    } else if (/\.(coffee|litcoffee|coffee\.md)$/.test(target)) {
      DEBUG && console.log('loading source file:', filename)
      coffeeRequire(filename, context)
    }
  }
}
