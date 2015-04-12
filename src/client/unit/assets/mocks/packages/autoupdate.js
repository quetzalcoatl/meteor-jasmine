// Mock out autoupdate to prevent that it tries to update CSS
Package.autoupdate = {
  Autoupdate: {
    newClientAvailable: function () {
      return false
    }
  }
}
