describe('ES6', function () {
  it('loads ES6 test files', function () {
    expect(true).toBe(true)
  });

  it('loads ES6 app files', function () {
    expect(App.ES6Variable).toBe('loaded');
  });
});
