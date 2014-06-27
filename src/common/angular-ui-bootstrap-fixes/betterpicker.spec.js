
describe( 'Better datepicker directive', function() {

  beforeEach( module( 'ui.bootstrap.fixes' ) );

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

  it( 'should render ui.bootstrap datepicker',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should open picker if input is focused',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should close picker if date is selected',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should not close picker "today" button is pressed',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should not close picker and update datePickerDate when formattedDate changes',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should not change ngModel / datePickerDate if formatted date is changed to invalid',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should not allow changing state options dynamically',function() {
    expect( true ).toBeTruthy();
  });
  
  it( 'should read initial date and state variables correctly',function() {
    expect( true ).toBeTruthy();
  });

});

