
angular.module( 'app.results', [
  'ui.router.state',
  'app.config',
  'app.results.service'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'results', {
    url: '/results/:id',
    views: {
      "main": {
        controller: 'ResultsCtrl',
        templateUrl: 'results/results.tpl.html'
      }
    },
    data:{ pageTitle: 'Activity results' }
  });
}])

.controller( 'ResultsCtrl', ['$scope', '$stateParams', 'ConfService', function ResultsController( $scope, $stateParams, cs ) {

  $scope.backend = cs.backend;

  // move this to separate service when needed somewhere else..
  $scope.teams = [ 
    { rank: 1, points : 13123, name: 'Rico La Mamaba', lastActive: "2010-20-2"},
    { rank: 2, points : 6123, name: 'Cher Nobyl', lastActive: "2010-20-2"}, 
    { rank: 3, points : 5123, name: 'Shuk Njorris', lastActive: "2010-20-2"}, 
    { rank: 4, points : 3123, name: 'Don Johnson', lastActive: "2010-20-2"}, 
    { rank: 5, points : 223, name: 'Mike the man', lastActive: "2010-20-2"}, 
    { rank: 6, points : 123, name: 'Joni Käteinen ', lastActive: "2010-20-2"}
  ];

}])

;
