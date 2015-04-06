/* globals getSpecFiles: true */

var fs = Npm.require('fs')

function getFiles(dir, matcher) {
  var allFiles = []
  var stat;

  try {
    stat = fs.statSync(dir)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(error)
    }
    return allFiles;
  }

  if (stat.isFile() && dir.match(matcher)) {
    allFiles.push(dir)
  } else {
    var files = fs.readdirSync(dir)
    for (var i = 0, len = files.length; i < len; ++i) {
      var filename = dir + '/' + files[i]
      if (fs.statSync(filename).isFile() && filename.match(matcher)) {
        allFiles.push(filename)
      } else if (fs.statSync(filename).isDirectory()) {
        var subfiles = getFiles(filename, matcher)
        allFiles.push.apply(allFiles, subfiles)
      }
    }
  }
  return allFiles
}

getSpecFiles = function (dir) {
  return getFiles(dir, new RegExp('\\.(js|coffee|litcoffee|coffee\\.md)$'))
}
