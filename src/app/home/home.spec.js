/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe( 'home section', function() {

  // Mock angular-translate to return key
  beforeEach(function () {
    module('pascalprecht.translate');
    module(function ($provide) {
      $provide.decorator('$translate', function($delegate) {
        var mock_translate = function (key) {
          var kind_of_promise = {};
          kind_of_promise.then = function (callback) {
            callback(key);
            return kind_of_promise;
          };
          console.log("Called mock $translate with key", key);
          return kind_of_promise;
        };
        mock_translate.instant = function (key) { return key; };
        mock_translate.storageKey = function () {};
        mock_translate.storage = function () {};
        mock_translate.preferredLanguage = function () {};
        return mock_translate;
      });
    });
  });

  beforeEach( module( 'app.home' ) );

  it( 'should have a dummy test', inject( function() {
    expect( true ).toBeTruthy();
  }));
});

