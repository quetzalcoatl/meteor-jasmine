describe('Async spec', function () {
  it('first async passed', function (done) {
    setTimeout(function () {
      expect(true).toBe(true)
      done()
    }, 100);
  })

  it('second async passed', function (done) {
    setTimeout(function () {
      expect(true).toBe(true)
      done()
    }, 100);
  })
})
