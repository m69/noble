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

.controller('QuestCtrl', function($scope, $state, $stateParams, $ionicActionSheet, NpmService, HistoryService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getModule($stateParams.module);
	});

	$scope.getModule = function(module) {
		NpmService.getNodeModule(module)
			.then(function(result) {
				$scope.module = result;
				$scope.getDependencies($scope.module);
				$scope.saveHistory(result);
			});
	};

	$scope.getDependencies = function(module) {
		$scope.modules = NpmService.getDependencies(module);
	};

	$scope.export = function(module) {
		// export module
	};

	$scope.saveHistory = function(module) {
		HistoryService.saveHistory(module);
	}
})

.controller('FlaggedCtrl', function($scope) {

})

.controller('HistoryCtrl', function($scope, HistoryService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getHistory();
	});

	$scope.getHistory = function() {
		HistoryService.getHistory()
		.then(function(result) {
			$scope.history = result;
		});
	};

})

.controller('ModuleCtrl', function($scope, $state, $stateParams, HistoryService) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getModule($stateParams.id);
	});

	$scope.getModule = function(id) {
		HistoryService.getModule(id)
		.then(function(result) {
			$scope.module = result;
		});
	};

	$scope.launchQuest = function(params) {
		$state.go('app.noble.quest', params);
	};

	$scope.launchBrowser = function(url) {
		window.open(url,'_blank');
	};
})

.controller('SettingsCtrl', function($scope) {

});
