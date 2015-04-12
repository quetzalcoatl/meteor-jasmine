/* globals mockLoader: true */

var path = Npm.require('path'),
    glob = Npm.require('glob')

mockLoader = {
  loadUserMocks: function (context) {
    var basePath = path.join(Velocity.getAppPath(), 'tests/jasmine/server/unit')
    this._getMockFiles(basePath).forEach(function (file) {
      log.debug('loading mock file:', file)
      fileLoader.loadFile(file, context)
    })
  },

  _getMockFiles: function (basePath) {
    var filenamePattern = '**/*-{stub,stubs,mock,mocks}.{js,coffee,litcoffee,coffee.md}'
    var files = glob.sync(filenamePattern, {cwd: basePath})
    files = files.map(function (file) {
      return path.join(basePath, file)
    })
    return files
  }
}
