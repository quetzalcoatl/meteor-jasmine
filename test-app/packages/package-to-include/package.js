Package.describe({
  name: 'package-to-include',
  version: '1.0.0'
})

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1')
  api.addFiles('package-to-include.js')
  api.export('PackageToInclude')
})
