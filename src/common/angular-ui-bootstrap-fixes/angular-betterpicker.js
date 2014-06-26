
angular.module( 'ui.bootstrap.fixes', [
  'ui.bootstrap',
  'pascalprecht.translate'
])

.directive( 'betterpicker', function () {
  return {
    templateUrl : 'angular-ui-bootstrap-fixes/tpl/betterpicker.tpl.html',
    restrict : 'E',
    scope : {
      ngModel : '=',
      state : '='
    },

    link: function(scope, element, attrs) {
      var defaults = {
        inputField : {
          dateFormat: 'YYYY-M-D',
          visible: true,
          placeholder: 'Pick a date...',
          valid: true
        },
        align: 'left',
        todayButton: true,
        closeButton: true,
        clearButton: true,
        isOpen: false
      };

      // extend options with default values and then
      // copy data to original reference to allow
      // dynamic control of datepicker properties.
      _.merge(defaults, scope.state);
      _.merge(scope.state, defaults);

      // ng-if creates child scope, to prevent isolation
      // provide variables of this scope through rootVars
      scope.rootVars = {};
      scope.rootVars.datePickerDate = new Date();
      scope.rootVars.formattedDate = null;

      //
      // Scope methods
      //

      scope.openPicker = function () {
        scope.state.isOpen = true;
      };

      // should be refactored to separate directive
      // if needed elsewhere
      scope.todayClick = function () {
        scope.ngModel = new Date();
      };
      scope.clearClick = function () {
        scope.ngModel = null;
        scope.state.isOpen = false;
      };
      scope.closeClick = function () {
        scope.state.isOpen = false;
      };

      // 
      // Watches
      // 

      // Update cycle: ngModel -> datePicker -> formattedDate -> ngMode
      //               cycle will end when all has the same date
      // if ngModel is set to null, formattedDate is set to null too

      // if ngModel is changed update datePickerDate
      scope.$watch('ngModel', function (newVal, oldVal) {
        //console.log("ngModel change:", newVal, oldVal);
        if (oldVal === newVal) { return; }
        if (!newVal) {
          scope.rootVars.formattedDate = null;
          return;
        }
        scope.rootVars.datePickerDate = newVal;
      });

      // if datePickerDate is changed update formattedDate
      scope.$watch('rootVars.datePickerDate', function (newVal, oldVal) {
        //console.log("datePickerDate change:", newVal, oldVal);
        if (oldVal === newVal) { return; }
        scope.rootVars.formattedDate = moment(newVal).format(
          scope.state.inputField.dateFormat);
        scope.state.inputField.valid = true;
      });

      // if formattedDate is changed update ngModel
      scope.$watch('rootVars.formattedDate', function (newVal, oldVal) {
        //console.log("formattedDate change:", newVal, oldVal);
        if (newVal === oldVal) { return; }
        var parsed = moment(newVal, scope.state.inputField.dateFormat, true);
        scope.state.inputField.valid = parsed.isValid();
        if (scope.state.inputField.valid) {
          scope.ngModel = parsed.toDate();
        }
      });
    }
  };
});