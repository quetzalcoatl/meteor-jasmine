var level = Meteor.isServer && process.env.VELOCITY_DEBUG ? 'debug' : 'info'
log = loglevel.createPackageLogger('[sanjo:jasmine]', level)
