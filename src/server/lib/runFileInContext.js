/* globals runCodeInContext: true, runFileInContext: true */

var vm = Npm.require('vm'),
    fs = Npm.require('fs'),
    readFile = Meteor.wrapAsync(fs.readFile)

runCodeInContext = function (code, context, filename) {
  try {
    if (context) {
      vm.runInContext(code, context, filename)
    } else {
      vm.runInThisContext(code, filename)
    }
  } catch(error) {
    log.error('The code has syntax errors.', error)
  }
}

runFileInContext = function (filename, context) {
  var code = readFile(filename, {encoding: 'utf8'})
  try {
    if (context) {
      vm.runInContext(code, context, filename)
    } else {
      vm.runInThisContext(code, filename)
    }
  } catch(error) {
    log.error('The file "' + filename + '" has syntax errors.', error)
  }
}
