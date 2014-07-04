
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
    var directiveEl = angular.element(template);
    $rootScope.$apply(function () {
      $compile(directiveEl)($rootScope);
    });
    jqEl = $(directiveEl);
    $('body').html(jqEl);
  };

  beforeEach(
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      $rootScope.pickerState = {};
      $rootScope.date = {};
      var defaultTemplate = '<div>' +
        '<div>{{date.selectedDate}}</div>' + 
        '<betterpicker ng-model="date.selectedDate" state="pickerState"></betterpicker>' +
        '</div>';
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
      expect($rootScope.date.selectedDate).toBeTruthy();
      expect(inputEl.val()).toBeTruthy();
    });

    it( 'should clear input field and model and close picker when "clear" is clicked',function() {
      $rootScope.date.selectedDate = new Date();
      var clearBtn = jqEl.find('button.bpBtnClear');
      var inputEl = jqEl.find('input');
      $rootScope.$digest();
      testTools.click(clearBtn);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(0);
      expect(inputEl.val()).toBeFalsy();
      expect($rootScope.date.selectedDate).toBe(null);
    });

    it( 'should close calendar and not change input / model if "close" is clicked',function() {
      var testDate = new Date();
      $rootScope.date.selectedDate = testDate;
      var clearBtn = jqEl.find('button.bpBtnClose');
      var inputEl = jqEl.find('input');
      $rootScope.$digest();
      var inputVal = inputEl.val();

      testTools.click(clearBtn);
      $rootScope.$digest();
      expect( jqEl.find('.pickerCalendar').length ).toBe(0);
      expect(inputEl.val()).toBe(inputVal);
      expect( moment($rootScope.date.selectedDate).format('YYYYMMDD') )
      .toBe(moment(testDate).format('YYYYMMDD'));        
    });

    it( 'should not close picker and update datePickerDate when formattedDate changes',function() {
      var dateStr = '2010-10-10';
      var inputEl = jqEl.find('input');
      testTools.setVal(inputEl, dateStr);
      $rootScope.$digest();
      expect( jqEl.find('thead').html() ).toContain('2010');
      expect( jqEl.find('table').length ).toBe(1); // for some reason jquery failed selecting .pickerCalendar
      expect( moment($rootScope.date.selectedDate).format('YYYY-MM-DD') ).toBe(dateStr);
    });

    it( 'should not change ngModel if formatted date is changed to invalid',function() {
      var dateStr = '2010-10-x';
      var inputEl = jqEl.find('input');
      var testDate = new Date();
      $rootScope.date.selectedDate = testDate;
      testTools.setVal(inputEl, dateStr);
      $rootScope.$digest();
      expect( moment($rootScope.date.selectedDate).format('YYYYMMDD') )
      .toBe(moment(testDate).format('YYYYMMDD'));
    });
  });

  it( 'should read initial date correctly, to picker and formatted date',function() {
    $rootScope.pickerState = {
      inputField : {
        dateFormat : 'YYYYMMDD'
      },
      isOpen : true
    };
    var testDate = moment().subtract('years', 1).toDate();
    $rootScope.pickerDate = moment().subtract('years', 1).toDate();
    initDirective('<div><betterpicker ng-model="pickerDate" state="pickerState"></betterpicker></div>');
    expect( jqEl.find('input').val() ).toBe(moment(testDate).format('YYYYMMDD'));
    
    var pickerScope = angular.element(jqEl.find('betterpicker')).scope();
    expect( moment(pickerScope.pickerDate).format('YYYYMMDD') )
    .toEqual(moment(testDate).format('YYYYMMDD'));
  });

  it( 'toggling state.isOpen from outer scope shows/hide picker',function() {
    $rootScope.pickerState.isOpen = true;
    $rootScope.$digest();
    expect( jqEl.find('.pickerCalendar').length ).toBe(1);

    $rootScope.pickerState.isOpen = false;
    $rootScope.$digest();
    expect( jqEl.find('.pickerCalendar').length ).toBe(0);
  });

  it( 'placeholder text is read from placeholder attribute',function() {
  });

  it( 'placeholder attribute is overridden by state.inputField.placeholder',function() {
  });


});

