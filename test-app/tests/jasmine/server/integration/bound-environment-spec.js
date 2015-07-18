describe('Server integration tests', function () {
  it('are bound to the Meteor environment', function () {
    expect(function () {
      a.find();
    }).not.toThrow();
  })
})
