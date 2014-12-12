describe('Assets', function () {
  describe('getText', function () {
    it('loads the content of an app asset as text', function () {
      expect(Assets.getText('test.txt')).toBe('WORKS\n')
    });
  });

  describe('getBinary', function () {
    it('loads the content of an app asset as binary', function () {
      var data = Assets.getBinary('test.txt')
      var dataAsText = String.fromCharCode.apply(null, data)
      expect(dataAsText).toBe('WORKS\n')
    });
  });
});
