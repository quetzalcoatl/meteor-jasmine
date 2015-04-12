Meteor.methods({
  'jasmine/isMirror': function () {
    return {
      isMirror: !!process.env.IS_MIRROR,
      parentUrl: process.env.PARENT_URL
    }
  }
})
