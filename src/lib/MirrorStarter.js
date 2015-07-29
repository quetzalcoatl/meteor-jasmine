/* globals MirrorStarter: true */

MirrorStarter = function (testingFrameworkName) {
  this.name = testingFrameworkName
}

_.extend(MirrorStarter.prototype, {

  lazyStartMirror: function (mirrorOptions) {
    var requestMirror = this.startMirror.bind(this, mirrorOptions)
    lazyStart(this.name, requestMirror)
  },

  startMirror: function (mirrorOptions) {
    var options = {
      framework: this.name
    }
    _.extend(options, mirrorOptions)

    if (!options.port) {
      options.port = freeport()
    }

    log.debug('Starting mirror for ' + this.name)

    // HACK: need to make sure after the proxy package adds the test files
    Meteor.setTimeout(function() {
      Meteor.call(
        'velocity/mirrors/request',
        options,
        function (error) {
          if (error) {
            log.error(error)
          }
        }
      )
    }, 100)
  },

  startSelfMirror: function (mirrorOptions) {
    mirrorOptions = mirrorOptions || {}
    VelocityMirrors.upsert(
      {framework: this.name},
      {
        framework: this.name,
        mongoUrl: process.env.MONGO_URL,
        host: process.env.ROOT_URL,
        rootUrl: process.env.ROOT_URL,
        rootUrlPath: mirrorOptions.rootUrlPath,
        state: 'ready',
        lastModified: Date.now()
      }
    )
  }

})
