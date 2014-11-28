Jasmine.onTest(function () {
  describe('Server Integration', function () {
    it('should work', function () {
      expect(true).toBe(true)
    });

    describe('mock', function () {
      it('should be available', function () {
        expect(mock).toBeDefined()
      });
    });
  });
});
