
angular.module( 'ui.bootstrap.fixes', [
  'ui.bootstrap',
  'pascalprecht.translate'
])

.directive( 'betterpicker', function () {
  return {
    templateUrl : 'angular-ui-bootstrap-fixes/tpl/betterpicker.tpl.html',
    restrict : 'E',
    scope : {
      ngModel : '='
    }
/*  ,
    link: function(scope, element, attrs) {

      //
      // Scope variables
      //

      scope.internalModel = angular.copy(scope.model);
      scope.internalModel.type = scope.model.type || 'all';

      //
      // Scope methods
      //

      scope.stopPropagation = function (event) {
        event.stopPropagation();
      };

      // should be refactored to separate directive
      // if needed elsewhere
      scope.datePickerToday = function (evt) {
      };
      scope.datePickerClear = function (evt) {
      };
      scope.datePickerClose = function (evt) {
      };

      //
      // Watches
      //

      scope.$watch('internalModel', function () {
        if (scope.internalModel.type === 'all') {
          scope.model.type = scope.internalModel.type;
          scope.model.start = null;
          scope.model.end = null;
        } else if (scope.internalModel.type === '24h') {
          scope.model.type = scope.internalModel.type;
          scope.model.start = new Date();
          scope.model.end = scope.model.start;
        } else if (scope.internalModel.type === 'range' && scope.internalModel.start && scope.internalModel.end) {
          scope.model.type = scope.internalModel.type;
          scope.model.start = new Date(scope.internalModel.start);
          scope.model.end = new Date(scope.internalModel.end);
        }
      }, true);
    }
*/
  };
});