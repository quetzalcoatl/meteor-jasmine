Meteor.methods({
  test: function (argument) {
    check(argument, Match.Any)
    console.log('Called Meteor method with ', argument)
    return true
  }
})
