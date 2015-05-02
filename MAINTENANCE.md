### Info for sanjo:jasmine maintainers

#### Testing

We use sanjo:jasmine for testing sanjo:jasmine. There is a test-app with tests that verify the correct behavior of sanjo:jasmine. There is still a lot of room for improvement for test coverage.

##### Running package unit tests

```bash
cd test-app
./run.sh
```

#### Publish a new version

1. Increase the version in `package.js` (follow [Semantic Versioning conventions](http://semver.org/))
2. `meteor publish`
3. Commit "Release of X.X.X"
4. Create a tag with the version "X.X.X"
5. Push (`git push && git push --tags`)
