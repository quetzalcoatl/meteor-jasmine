describe('jasmine-jquery', function () {
  it('is loaded', function () {
    // This matcher is added by jasmine-jquery. So this checks if it is loaded.
    expect($('<input type="checkbox" checked="checked"/>')).toBeChecked()
  });
});
