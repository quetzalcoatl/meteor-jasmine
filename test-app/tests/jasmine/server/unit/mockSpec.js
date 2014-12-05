describe('mock', function () {
  var fooSpy = jasmine.createSpy('foo')
  var myObject = {
    foo: fooSpy
  }

  it('mocks an object property', function () {
    mock(myObject, 'foo')
    myObject.foo()
    expect(fooSpy).not.toHaveBeenCalled()
  });

  // This test is connected with the previous one
  it('restores the object property after each test', function () {
    myObject.foo()
    expect(fooSpy).toHaveBeenCalled()
  });
});
