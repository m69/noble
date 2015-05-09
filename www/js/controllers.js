angular.module('noble.controllers', [])

.controller('MenuCtrl', function($scope) {

})
.controller('NobleCtrl', ['$scope', '$state', 'NobleServer', '$ionicLoading', '$ionicPopup', function($scope, $state, NobleServer, $ionicLoading, $ionicPopup) {

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

	$scope.searchModule = function(module) {

		if(module !== null || module !== undefined || module !== '') {
			var params = {
				module: module
			};

			$ionicLoading.show({
				template: 'Searching...'
			});

			NobleServer.getNodeModule(module)
				.then(function(result) {
					$state.go('app.noble.module', {module: module});
				}, function(error) {
					$ionicPopup.alert({
						title: 'Opps!',
						template: 'Looks like it wasn\'t found :(',
						buttons: [{
							text: 'Bummer',
							type: 'button-assertive'
						}]
					});
				}).finally(function(result) {
					$ionicLoading.hide();
				});

		}
	};

}])

.controller('ModuleCtrl', ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicPopup', 'NobleServer', function($scope, $state, $stateParams, $ionicLoading, $ionicPopup, NobleServer) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getModule($stateParams.module);
	});

	$scope.getModule = function(module) {
		NobleServer.getNodeModule(module)
		.then(function(result) {
			$scope.module = result;
		})
		.finally(function(result) {
			$ionicLoading.hide();
		});
	};

	$scope.launchQuest = function(params) {

		$ionicLoading.show({
			template: '<div class="quest-loading"><p>Standby...<br>This may take a few moments.</p></div>'
		});

		NobleServer.getNodeModuleDependencies(params.module + '@' + params.version)
			.then(function(result) {
				$state.go('app.noble.quest', params);
			})
			.finally(function(result) {
				$ionicLoading.hide();
			});
	};

	$scope.launchBrowser = function(url) {
		window.open(url,'_blank');
	};
}])

.controller('QuestCtrl', ['$scope', '$state', '$stateParams', '$ionicActionSheet', '$ionicNavBarDelegate', '$ionicLoading', '$ionicPopup', '$ionicModal', 'NobleServer', 'HistoryService', function($scope, $state, $stateParams, $ionicActionSheet, $ionicNavBarDelegate, $ionicLoading, $ionicPopup, $ionicModal, NobleServer, HistoryService) {
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.modal = $ionicModal.fromTemplateUrl('templates/quest-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});


	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.module = {};
		$scope.module.name = $stateParams.module;
		$scope.module.version = $stateParams.version;
	});

	$scope.$on('$ionicView.enter', function() {
		$scope.getModules($stateParams.module + '@' + $stateParams.version);
	});

	 //Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	$scope.startQuest = function(module) {
		$scope.modules = NobleServer.startQuest(module);
		$scope.count = $scope.modules.length;
	};

	$scope.getModules = function(module) {

		NobleServer.getNodeModuleDependencies(module)
		.then(function(result) {
			$scope.modules = result.modules;
			$scope.count = result.stats.resolved;
			$scope.stats = result.stats;
			$scope.module.report = result.report;
		})
		.finally(function(result) {
			$scope.modal.show();
		});
	};

	$scope.getModule = function(module) {

		$ionicLoading.show({
			template: 'Searching...'
		});

		NobleServer.getNodeModule(module)
			.then(function(result) {
				$state.go('app.noble.module', {module: module});
			}, function(error) {
				$ionicPopup.alert({
					title: 'Opps!',
					template: 'Looks like it wasn\'t found :(',
					buttons: [{
						text: 'Bummer',
						type: 'button-assertive'
					}]
				});
			})
			.finally(function(result) {
				$ionicLoading.hide();
			});
	};

	$scope.actions = function() {

		var actionSheet = $ionicActionSheet.show({
			buttons: [
				{ text: 'Download Report' },
				{ text: 'Refresh Results' }
			],
			titleText: 'Quickly Now',
			cancelText: 'Cancel',
			cancel: function() {
				actionSheet();
			},
			buttonClicked: function(index) {
				if(index === 0) {

					NobleServer.getReport($scope.module.report)
					.then(function(result) {
						console.log(result);

						$ionicPopup.show({
							title: 'Report Downloaded',
							subTitle: 'Would you like to view reports?',
							buttons: [
								{ text: 'Cancel' },
								{
									text: 'Open',
									type: 'button-positive',
									onTap: function(e) {
										$state.go('app.reports');
									}
								}
							]
						});
					})
					.finally(function(result) {
						
					});
				}else if(index === 1) {
					$state.go($state.current, {}, {reload: true});
				}
				return true;
			}
		});
	}

}])

.controller('HistoryCtrl', ['$scope', 'HistoryService', function($scope, HistoryService) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getHistory();
	});

	$scope.getHistory = function() {
		HistoryService.getHistory()
		.then(function(result) {
			$scope.history = result;
		});
	};

	$scope.deleteItem = function(module) {
		HistoryService.deleteModule(module)
		.then(function(result) {
			if(result) {
				$scope.history = result;
			}
		});
	};

}])

.controller('ReportsCtrl', ['$scope', 'HistoryService', 'EmailService', function($scope, HistoryService, EmailService) {

	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getReports();
	});

	$scope.getReports = function() {
		HistoryService.getReports()
		.then(function(result) {
			$scope.reports = result;
		});
	};

	$scope.sendEmail = function(report) {
		EmailService.sendEmail(report);
	};

	$scope.deleteItem = function(module) {
		HistoryService.deleteReport(module)
		.then(function(result) {
			if(result) {
				$scope.reports = result;
			}
		});
	};

}])

.controller('SettingsCtrl', ['$scope', 'HistoryService', '$ionicPopup', 'Settings', function($scope, HistoryService, $ionicPopup, Settings) {

	$scope.$on('$ionicView.loaded', function() {
		Settings.load();
	});

	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.getSettings();
	});

	$scope.getSettings = function() {
		$scope.nobleSettings = [
			{
				text: 'Cache Requests',
				checked: true
			},
			{
				text: 'Vulnerability Scan',
				checked: true
			}
		];

		$scope.clearData = [
			{
				text: 'Clear History',
				checked: false,
				tap: $scope.clearHistory
			},
			{
				text: 'Delete Reports',
				checked: false,
				tap: $scope.deleteReports
			}
		];
	};

	$scope.showPopup = function(title) {
		$ionicPopup.show({
			title: title,
			buttons: [{
				text: 'OK',
				type: 'button-assertive'
			}]
		});
	};

	$scope.clearHistory = function() {
		HistoryService.clearHistory()
		.then(function(result) {
			if(result) {
				$scope.showPopup('History Cleared');
			}
		})
		.finally(function() {
			
		});
	};

	$scope.deleteReports = function() {
		HistoryService.deleteReports()
		.then(function(result) {
			if(result) {
				$scope.showPopup('Reports Deleted');
			}
		})
		.finally(function() {

		});
	};
}]);
