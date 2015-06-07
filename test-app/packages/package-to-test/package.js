Package.describe({
  name: 'package-to-test',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('package-to-test.js');
  api.export('PackageToTest');
});

Package.onTest(function(api) {
  api.use('sanjo:jasmine@0.14.0');
  api.use('package-to-test');
  api.addFiles('tests/server/example-spec.js', 'server');
  api.addFiles('tests/client/example-spec.js', 'client');
});
