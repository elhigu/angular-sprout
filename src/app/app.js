angular.module( 'appMain', [
  'templates-app',
  'templates-common',
  'app.home',
  'app.results',
  'ui.router.state',
  'ui.router',
  'pascalprecht.translate'
])

.config( ['$stateProvider', '$urlRouterProvider', function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
}])

.config(['$translateProvider', function ($translateProvider) {
  // Initialize angular-translate
  $translateProvider.useStaticFilesLoader({
    prefix: 'assets/i18n/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('fi');
  // $translateProvider.useLocalStorage();
  // $translateProvider.useMissingTranslationHandlerLog();
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

