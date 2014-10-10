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

  // fix for angular-translate's getLocale to get preferred language 
  // from first language in preferred langauge list on Chrome instead
  // of nav.language
  $translateProvider.determinePreferredLanguage(function () {
    var getLocale = function () {
      var nav = window.navigator;
      return ((nav.languages && nav.languages[0]) ||
        nav.language ||
        nav.browserLanguage ||
        nav.systemLanguage ||
        nav.userLanguage || '').split('-').join('_');
    };
    return getLocale().split('_')[0];
  });

  $translateProvider.fallbackLanguage('en');
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

