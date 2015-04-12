'use strict';

describe('--settings', function () {

  it('are passed to the mirror', function () {
    expect(Meteor.settings.foo).toEqual('bar');
  });

});
