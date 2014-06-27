
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
          placeholder: null,
          valid: true
        },
        align: 'left',
        todayButton: true,
        closeButton: true,
        clearButton: true,
        isOpen: false
      };

      // element attributes affect to "default" values
      // can be overridden by scope.state
      if (attrs.placeholder) {
        defaults.inputField.placeholder = attrs.placeholder;
      } else {
        defaults.inputField.placeholder = "e.g. " + moment().format(defaults.inputField.dateFormat);
      }

      // create state if not given
      if (!scope.state) {
        scope.state = {};
      }

      // extend options with default values and then
      // copy data to original reference to allow
      // dynamic control of datepicker properties.
      _.merge(defaults, scope.state);
      _.merge(scope.state, defaults);

      // ng-if creates child scope, to prevent isolation
      // provide variables of this scope through rootVars
      scope.rootVars = {};
      scope.rootVars.formattedDate = null;

      //
      // Scope methods
      //

      // TODO: somehow detect if click is happening
      //       in directive and prevent closing 
      //       even if input would be blurred...

      scope.openPicker = function () {
        scope.state.isOpen = true;
      };

      scope.closePicker = function () {
        scope.state.isOpen = false;
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

      // NOTE: this is horrible hack implementation... 
      // what would be correct way to run this kind of cyclic dependency?
      // maybe to have just one watch that listens all the variables...
      var firstChange = null;

      // if ngModel is changed update datePickerDate
      scope.$watch('ngModel', function (newVal, oldVal) {
        if (_.isUndefined(newVal)) { return; }
        // console.log("ngModel", newVal, oldVal);
        if (firstChange === this) {
          firstChange = null;
          return; 
        } else if (firstChange === null) {
          firstChange = this;
        }

        if (!newVal) {
          scope.rootVars.formattedDate = null;
          return;
        }
        scope.rootVars.datePickerDate = newVal;
      });

      // if datePickerDate is changed update formattedDate
      scope.$watch('rootVars.datePickerDate', function (newVal, oldVal) {
        if (_.isUndefined(newVal)) { return; }
        // console.log("datePickerDate", newVal, oldVal);
        if (firstChange === this) {
          firstChange = null;
          return; 
        } else if (firstChange === null) {
          firstChange = this;
        }

        // if we detected select from calendar close popup
        if (firstChange === this) {
          scope.closePicker();
        }

        var formattedDate = moment(newVal).format(
          scope.state.inputField.dateFormat);

        if (formattedDate !== scope.rootVars.formattedDate) {
          scope.rootVars.formattedDate = formattedDate;
          scope.state.inputField.valid = true;
        } else {
          firstChange = null;
        }  
      });

      // if formattedDate is changed update ngModel
      scope.$watch('rootVars.formattedDate', function (newVal, oldVal) {
        if (_.isUndefined(newVal)) { return; }
        // console.log("formattedDate", newVal, oldVal);
        if (firstChange === this) {
          firstChange = null;
          return; 
        } else if (firstChange === null) {
          firstChange = this;
        }

        var parsed = moment(newVal, scope.state.inputField.dateFormat, true);
        scope.state.inputField.valid = parsed.isValid();
        if (scope.state.inputField.valid) {
          scope.ngModel = parsed.toDate();
        } else {
          firstChange = null; /** must be nullified if update watch loop ends... */
        }
      });
    }
  };
});