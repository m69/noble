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

	$scope.searchModule = function(module) {
		if(module !== null || module !== undefined || module !== '') {
			var params = {
				module: module
			}
			$state.go('app.noble.module', params);
		}
	};

})

.controller('QuestCtrl', function($scope, $state, $stateParams, $ionicActionSheet, $ionicNavBarDelegate, $ionicLoading, NpmService, HistoryService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$ionicLoading.show({
			template: 'Wise men do not <br>make demands of Kings.'
		})
		$scope.module = {};
		$scope.module.name = $stateParams.module;
		$scope.module.version = $stateParams.version;
	});

	$scope.$on('$ionicView.enter', function() {
		$scope.startQuest($stateParams.module);
	});

	$scope.startQuest = function(module) {
		$scope.modules = NpmService.startQuest(module);
		$scope.count = $scope.modules.length;
		$ionicLoading.hide();
	};

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

.controller('ModuleCtrl', function($scope, $state, $stateParams, NpmService) {
	$scope.$on('$ionicView.beforeEnter', function() {
		//$scope.getModule($stateParams.id);
		$scope.getModule($stateParams.module);
	});

	$scope.getModule = function(module) {
		NpmService.getNodeModule(module)
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
