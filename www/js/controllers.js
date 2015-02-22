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

	// $scope.launchQuest = function(quest) {
	// 	if(quest !== null || quest !== undefined || quest !== '') {
	// 		var params = {
	// 			module: quest
	// 		}
	// 		$state.go('app.noble.quest', params);
	// 	}
	// };

	$scope.searchModule = function(module) {
		if(module !== null || module !== undefined || module !== '') {
			var params = {
				module: module
			}
			$state.go('app.noble.module', params);
		}
	};

})

.controller('ModuleCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicPopup, NobileServer) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$ionicLoading.show({
			template: 'Sending a rider...'
		});
		$scope.getModule($stateParams.module);
	});

	$scope.getModule = function(module) {
		NobileServer.getNodeModule(module)
		.then(function(result) {
			$scope.module = result;
		})
		.catch(function(error) {
			$ionicLoading.hide();
			$state.go('^');
		})
		.finally(function(result) {
			$ionicLoading.hide();
		});
	};

	$scope.launchQuest = function(params) {
		$state.go('app.noble.quest', params);
	};

	$scope.launchBrowser = function(url) {
		window.open(url,'_blank');
	};
})

.controller('QuestCtrl', function($scope, $state, $stateParams, $ionicActionSheet, $ionicNavBarDelegate, $ionicLoading, $ionicPopup, NobileServer, HistoryService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$ionicLoading.show({
			template: 'Wise men do not <br>make demands of Kings...'
		});
		$scope.module = {};
		$scope.module.name = $stateParams.module;
		$scope.module.version = $stateParams.version;
	});

	$scope.$on('$ionicView.enter', function() {
		$scope.getModules($stateParams.module);
	});

	$scope.startQuest = function(module) {
		$scope.modules = NobileServer.startQuest(module);
		$scope.count = $scope.modules.length;
		$ionicLoading.hide();
	};

	$scope.getModules = function(module) {
		NobileServer.getNodeModuleDependencies(module)
		.then(function(result) {
			$scope.modules = result.modules;
			$scope.count = result.stats.resolved;
			$scope.module.report = result.report;
		})
		.finally(function(result) {
			$ionicLoading.hide();
		});
	};

	$scope.actions = function() {

		var actionSheet = $ionicActionSheet.show({
			buttons: [
				{ text: 'Export to Excel' },
				{ text: 'Save Results' }
			],
			titleText: 'Quickly Now',
			cancelText: 'Cancel',
			cancel: function() {
				actionSheet();
			},
			buttonClicked: function(index) {
				if(index === 0) {

					NobileServer.getReport($scope.module.report)
					.then(function(result) {
						console.log(result);

						$ionicPopup.show({
							title: 'Report Downloaded',
							subTitle: 'Would you like to view the report now?',
							buttons: [
								{ text: 'Cancel' },
								{
									text: 'Open',
									type: 'button-positive',
									onTap: function(e) {
										window.open(result.toURL(),'_blank');
									}
								}
							]
						});
					})
					.finally(function(result) {
						
					});
				}else if(index === 1) {
					console.log('save report');
				}
				return true;
			}
		});
	}

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

.controller('ReportsCtrl', function($scope, HistoryService) {

	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getReports();
	});

	$scope.getReports = function() {
		HistoryService.getReports()
		.then(function(result) {
			$scope.reports = result;
		});
	};

})

.controller('SettingsCtrl', function($scope) {

});
