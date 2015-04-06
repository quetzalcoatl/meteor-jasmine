/* globals log: true */

var level = Meteor.isServer && process.env.VELOCITY_DEBUG ? 'debug' : 'info'
if (Meteor.isServer && process.env.JASMINE_LOG_LEVEL) {
  level = process.env.JASMINE_LOG_LEVEL
}
log = loglevel.createPackageLogger('[sanjo:jasmine]', level)
