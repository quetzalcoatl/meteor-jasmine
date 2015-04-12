/* globals fileLoader: true, loadOrderSort: false */

var appPath = MeteorFilesHelpers.getAppPath(),
    fs = Npm.require('fs'),
    readDir = Meteor.wrapAsync(fs.readdir, fs),
    path = Npm.require('path'),
    glob = Meteor.wrapAsync(Npm.require('glob'))

fileLoader = {
  loadFiles: loadFiles,
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
function loadFiles(context, options) {
  var files = getFiles(options)
  files.sort(loadOrderSort([]))
  log.debug('loadFiles', files)
  _.each(files, function (file) {
    loadFile(file, context)
  })
}

/**
 * Get all files that should be loaded.
 * @param options
 * @returns {Array}
 */
function getFiles(options) {
  options = _.extend({
    ignoreDirs: []
  }, options)

  var filePattern = '*.{js,coffee,litcoffee,coffee.md}';

  // Find files in the root folder
  var files = glob(filePattern,
    {
      cwd: appPath,
      ignore: 'mobile-config.js'
    }
  )

  // Find files in the sub folders that we don't ignore
  var shouldIgnore = ['tests', 'private', 'public', 'programs', 'packages']
  shouldIgnore = shouldIgnore.concat(options.ignoreDirs)

  var relevantDirs = readdirNoDots(appPath)
  relevantDirs = _.filter(relevantDirs, function (dir) {
    return !_.contains(shouldIgnore, dir)
  })

  files = _.reduce(relevantDirs, function (files, dir) {
    var newFiles = glob(filePattern,
      {
        cwd: path.join(appPath, dir),
        matchBase: true
      }
    )
    newFiles = _.map(newFiles, function (filePath) {
      return path.join(dir, filePath);
    });

    return files.concat(newFiles)
  }, files)

  log.debug('getFiles has found the following files', files)

  return files;
}

function readdirNoDots(path) {
  var entries
  try {
    entries = readDir(path);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    } else {
      throw error;
    }
  }
  return _.filter(entries, function (entry) {
    return entry && entry[0] !== '.'
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
  var filename = path.resolve(appPath, target),
      ext

  if (fs.existsSync(filename)) {
    ext = path.extname(filename)
    if ('.js' === ext) {
      log.debug('loading source file:', filename)
      runFileInContext(filename, context)
    } else if (/\.(coffee|litcoffee|coffee\.md)$/.test(target)) {
      log.debug('loading source file:', filename)
      coffeeRequire(filename, context)
    }
  } else {
    log.error(
      'loadFile could not load "' + filename + '". ' +
      'The file does not exist.'
    );
  }
}
