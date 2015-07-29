/* globals JasmineInterface: true */

var jasmineRequire = Meteor.isServer ?
  Npm.require('jasmine-core') :
  window.jasmineRequire

/**
 * Object that will be directly put into the global context of the running
 * tests.
 *
 * ex.
 *     describe(...)   // rather than 'jasmine.describe'
 *     jasmine.clock   // rather than just 'clock'
 *
 * @class JasmineInterface
 * @constructor
 */
JasmineInterface = function (options) {
  if (!options || !options.jasmine) {
    throw new Error('[JasmineInterface] Missing required field "jasmine"')
  }

  var env = options.jasmine.getEnv()

  _.extend(this, jasmineRequire.interface(options.jasmine, env))

  var markBottom = function (func) {
    var boundFunction = parseStack.markBottom(func)
    if (func.length > 0) {
      // Async test
      return function (done) {
        return boundFunction.apply(this, arguments)
      }
    } else {
      // Sync test
      return function () {
        return boundFunction.call(this)
      }
    }
  }

  _.forEach(['describe', 'xdescribe', 'fdescribe', 'it', 'fit'], function (word) {
    var originalFunction = this[word]
    this[word] = function (/* arguments */) {
      arguments[1] = markBottom(arguments[1])
      return originalFunction.apply(this, arguments)
    }
  }, this)

  _.forEach(['beforeEach', 'afterEach', 'beforeAll', 'afterAll'], function (word) {
    var originalFunction = this[word]
    this[word] = function (/* arguments */) {
      arguments[0] = markBottom(arguments[0])
      return originalFunction.apply(this, arguments)
    }
  }, this)
}
