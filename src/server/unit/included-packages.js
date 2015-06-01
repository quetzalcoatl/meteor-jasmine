/* globals packagesToIncludeInUnitTests: true */

// Packages that should be included in unit test mode
// and therefore should not be mocked
packagesToIncludeInUnitTests = [
  'lodash',
  'stevezhu:lodash',
  'erasaur:meteor-lodash',
  'underscore',
  'digilord:sugarjs',
  'momentjs:moment',
  'mrt:moment',
  'rzymek:moment',
  'xolvio:webdriver'
]

var customIncludedPackages =
  process.env.JASMINE_PACKAGES_TO_INCLUDE_IN_UNIT_TESTS
if (customIncludedPackages) {
  packagesToIncludeInUnitTests = packagesToIncludeInUnitTests
    .concat(customIncludedPackages.split(','))
}
