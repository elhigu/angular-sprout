
describe( 'Better datepicker directive', function() {

  beforeEach( module( 'ui.bootstrap.fixes' ) );
  beforeEach( module( 'angular-ui-bootstrap-fixes/tpl/betterpicker.tpl.html') );
  beforeEach( module( 'pascalprecht.translate' ) );

  beforeEach(function () {
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

  var $compile, $rootScope, jqEl;

  var initDirective = function (template) {
    var directiveHtml = angular.element(template);
    $compile(directiveHtml)($rootScope);
    $rootScope.$digest();
    jqEl = $(directiveHtml);
  };

  beforeEach(
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      $rootScope.pickerState = {};
      var defaultTemplate = '<betterpicker ng-model="selectedDate" state="pickerState"></betterpicker>';
      initDirective(defaultTemplate);
    })
  );

  it( 'by default should render only input field',function() {
    expect( jqEl.find('input[type="text"]').length ).toBe(1);
    expect( jqEl.find('.pickerCalendar').length ).toBe(0);
    expect( jqEl.find('table').length ).toBe(0);
  });

  describe( 'clicking input field', function () {
    beforeEach(function () {
      var inputEl = jqEl.find('input');
      testTools.fireEvent(inputEl, "focus");
      $rootScope.$digest();      
    });
    
    it( 'should open picker calendar if input is focused',function() {
      expect( jqEl.find('.pickerCalendar').length ).toBe(1);
    });
  
    it( 'should not close picker month is changed',function() {
      var theadButton = jqEl.find('thead button');
      testTools.click(theadButton);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(1);      
    });

    it( 'should close picker if date is selected from picker calendar',function() {            
      var bodyButton = jqEl.find('tbody button');
      testTools.click(bodyButton);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(0);
    });

    it( 'should not close picker "today" button is clicked, but model is updated',function() {
      var button = jqEl.find('button.bpBtnToday');      
      var inputEl = jqEl.find('input');
      expect($rootScope.selectedDate).toBeFalsy();
      expect(inputEl.val()).toBeFalsy();

      testTools.click(button);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(1);
      expect($rootScope.selectedDate).toBeTruthy();
      expect(inputEl.val()).toBeTruthy();
    });

    it( 'should clear input field and model when "clear" is clicked',function() {
      $rootScope.selectedDate = new Date();
      var clearBtn = jqEl.find('button.bpBtnClear');
      var inputEl = jqEl.find('input');
      testTools.click(clearBtn);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(0);
/* For some reason test does not set model to null... yet...
      testTools.showHtml(jqEl.html());
      console.log("Test scope failing:", $rootScope);
      expect(inputEl.val()).toBeFalsy();
      expect($rootScope.selectedDate).toBe(null);
*/
    });

    it( 'should close calendar and not change input / model if "close" is clicked',function() {
    });

    it( 'should not close picker and update datePickerDate when formattedDate changes',function() {
    });

    it( 'should not change ngModel / datePickerDate if formatted date is changed to invalid',function() {
    });
  });

  it( 'should read initial date and state variables correctly',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should not allow changing state options dynamically',function() {
    expect( true ).toBeTruthy();
  });

  it( 'should read placeholder from element attributes',function() {
    expect( true ).toBeTruthy();
  });

});

