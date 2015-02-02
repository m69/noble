angular.module('noble.controllers', [])

.controller('MenuCtrl', function($scope) {

})
.controller('NobleCtrl', function($scope, $state) {

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
			var params = {
				module: quest
			}
			$state.go('app.noble.quest', params);
		}
	};

})

.controller('QuestCtrl', function($scope, $state, $stateParams, NpmService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getModule($stateParams.module);
	});

	$scope.getModule = function(module) {
		NpmService.getNodeModule(module)
			.then(function(result) {
				$scope.module = result;
				$scope.getDependencies($scope.module);
			});
	};

	$scope.getDependencies = function(module) {
		$scope.modules = NpmService.getDependencies(module);
	}
})

.controller('FavoritesCtrl', function($scope) {

})

.controller('FlaggedCtrl', function($scope) {

})

.controller('HistoryCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope) {

});
