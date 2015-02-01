angular.module('noble.controllers', [])

.controller('MenuCtrl', function($scope) {

})
.controller('NobleCtrl', function($scope, NpmService) {

	$scope.values = [
		{name: 'Courage'},
		{name: 'Truth'},
		{name: 'Honour'},
		{name: 'Fidelity'},
		{name: 'Discipline'},
		{name: 'Hospitality'},
		{name: 'Self Reliance'},
		{name: 'Industriousness'},
		{name: 'Perseverance'}
	];

	$scope.messages = [
		{name: 'Journey Well'},
		{name: 'Make Haste'},
		{name: 'Winter is Coming'},
		{name: 'Quest On'},
		{name: 'Farewell'},
		{name: 'Gallop'},
		{name: 'Take Wing'},
		{name: 'Make Tracks'}
	];

	$scope.getMessage = function() {
		return $scope.messages[Math.floor((Math.random() * $scope.messages.length))].name;
	};

	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.message = $scope.getMessage();
		$scope.quest = '';
	});

	$scope.launchQuest = function(quest) {
		if(quest !== null || quest !== undefined || quest !== '') {
			NpmService.getNodeModule(quest)
			.then(function(result) {
				console.log(result);
			});
		}
	};

})

.controller('FavoritesCtrl', function($scope) {

})

.controller('FlaggedCtrl', function($scope) {

})

.controller('HistoryCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope) {

});
