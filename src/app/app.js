angular.module( 'appMain', [
  'templates-app',
  'templates-common',
  'app.home',
  'app.results',
  'ui.router.state',
  'ui.router'
])

.config( ['$stateProvider', '$urlRouterProvider', function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
}])

.run( function run () {
})

.controller( 'AppCtrl', [ '$scope', '$location', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | appMain' ;
    }
  });
}])

;

