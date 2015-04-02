// Use new documented Meteor.wrapAsync while supporting older versions
// of Meteor that only have Meteor._wrapAsync
wrapAsync = Meteor.wrapAsync || Meteor._wrapAsync
