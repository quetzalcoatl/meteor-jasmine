describe('Server Integration 2', function () {

  // This test must not be in the first executed describe block.
  // For this reason the test exists two times to ensure this condition.
  it('runs in the Meteor fiber', function () {
    var callMeteorMethod = function () {
      expect(Meteor.call('test', 1)).toBe(true)
    }
    expect(callMeteorMethod).not.toThrow()
  });

});
