angular.module( 'common.ng-scope-element', ['app.config'])

//
// Exports dom element to scope. This should be used only as a last resort.  
//
// Usage: <div ng-scope-element="scopeVariable"></div>
// Result: jQLite element is put to $scope.scopeVariable
.directive("ngScopeElement", function () {
  var directiveDefinitionObject = {
    restrict: "A",
    compile: function compile(tElement, tAttrs, transclude) {
      return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
            scope[iAttrs.ngScopeElement] = iElement;
          }
      };
    }
  };
  return directiveDefinitionObject;
})

;
