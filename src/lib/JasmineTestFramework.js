/* globals JasmineTestFramework: true */

JasmineTestFramework = function (options) {
  if (!options || !options.name) {
    throw new Error('[JasmineTestFramework] Missing required field "name"')
  }

  if (!options.regex) {
    throw new Error('[JasmineTestFramework] Missing required field "regex"')
  }

  if (_.isUndefined(options.jasmineRequire)) {
    throw new Error('[JasmineTestFramework] Missing required field "jasmineRequire"')
  }

  this.name = options.name
  this.regex = options.regex
  this.sampleTestGenerator = options.sampleTestGenerator
  this.logPrefix = options.logPrefix || '[' + this.name + '] '
  this.jasmineRequire = options.jasmineRequire

  // load jasmine-velocity reporter
  // [unit] mock packages

}

_.extend(JasmineTestFramework.prototype, {

  //////////////////////////////////////////////////////////////////////
  // Public functions
  //

  runTests: function () {},

  //////////////////////////////////////////////////////////////////////
  // Protected functions
  //

  registerWithVelocity: function () {
    Velocity.registerTestingFramework(this.name, {
      regex: this.regex,
      sampleTestGenerator: this.sampleTestGenerator
    })
  }

})
