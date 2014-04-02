angular.module( 'app.about', [
  'ui.router.state',
  'placeholders',
  'ui.bootstrap'
])

.config(['$stateProvider', function ( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "main": {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    data:{ pageTitle: 'What is It?' }
  });
}])

.controller( 'AboutCtrl', ['$scope', function ( $scope ) {
  // This is simple a demo for UI Boostrap.
  $scope.dropdownDemoItems = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];
}])

;
