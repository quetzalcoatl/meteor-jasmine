describe('Async spec', function () {
  it('first async passes', function (done) {
    expect(done).toBeDefined();
    setTimeout(Meteor.bindEnvironment(function () {
      expect(true).toBe(true)
      done()
    }), 100)
  })

  it('second async passes', function (done) {
    expect(done).toBeDefined();
    setTimeout(Meteor.bindEnvironment(function () {
      expect(true).toBe(true)
      done()
    }), 100)
  })
})
