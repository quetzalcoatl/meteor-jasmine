/* globals Package: false */

(function (context, mocker, Package) {
  var originals = []

  /**
   * Used in user tests, helper function to mock any object you provide.
   * Automatically reverts the mocked object after each test.
   *
   * NOTE: Depends on 'afterEach' global function
   *
   * @method mock
   */
  var mock = function (object, propertyName, options) {
    if (typeof object !== 'object' && typeof object !== 'function') {
      throw new Error('object must be an object')
    }
    if (typeof propertyName !== 'string') {
      throw new Error('propertyName must be a string')
    }
    if (typeof object[propertyName] === 'undefined') {
      throw new Error('property does not exist on object')
    }

    options = options || {}

    originals.push({
      object: object,
      propertyName: propertyName,
      value: object[propertyName],
      options: options
    })
    var metadata = mocker.getMetadata(object[propertyName])
    var mock = mocker.generateFromMetadata(metadata)
    object[propertyName] = mock
    return mock
  }

  context.mock = mock

  var mockPackage = function (packageName, options) {
    if (typeof packageName !== 'string') {
      throw new Error('packageName must be a string')
    }

    return Package[packageName] ? mock('Package', packageName, options) : null
  }

  context.mockPackage = mockPackage

  function restoreOriginal(original) {
    if (!original.options.permanent) {
      original.object[original.propertyName] = original.value
    }
  }

  function restoreOriginals() {
    originals.forEach(restoreOriginal)
    originals = []
  }

  afterEach(restoreOriginals)
})(
  (typeof window !== 'undefined') ? window : global,
  (typeof window !== 'undefined') ? window.mocker : global.ComponentMocker,
  Package
);
