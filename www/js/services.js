angular.module('noble.services', [])

.factory('NodeModule', [function() {
	// constructor with class name
	function NodeModule(config) {
		this.name = config.name || null;
		this.version = config.version || null;
		this.preferGlobal = config.preferGlobal || false;
		this.description = config.description || null;
		this.homepage = config.homepage || null;
		this.keywords = config.keywords || null;
		this.repository = config.repository || null;
		this.author = config.author || null;
		this.license = config.license || null;
		this.dependencies = config.dependencies || null;
		this.bugs = config.bugs || null;
		this.id = config._id || null;
		this.npmVersion = config._npmVersion || null;
		this.nodeVersion = config._nodeVersion || null;
		this.maintainers = config.maintainers || null;
	}

	// generic validator
	NodeModule.prototype.validate = function() {
		if(!this.name || !this.version) {
			return false;
		}

		return true;
	};
 
	// return constructor function
	return NodeModule;
}])

.factory('NpmService', ['$q', '$http', 'NodeModule', 'HistoryService', function($q, $http, NodeModule, HistoryService) {

	var tree = [];

	var _getNodeModule = function(query, version) {

		var d = $q.defer();

		if(!query) {
			d.reject('No Query');
		}else{

			var module = HistoryService.getModule(query);

			if(module) {
				d.resolve(module);
			}else{
				$http({
					method: 'JSONP',
					url: 'http://64.49.237.155:6900/' + query.toString().toLowerCase(),
					params: {
						version: version || 'latest',
						callback: 'JSON_CALLBACK'
					}
				})
				.success(function(data) {
					var nodeModule = new NodeModule(data);

					HistoryService.saveHistory(nodeModule);

					d.resolve(nodeModule);
				})
				.error(function(reason) {
					d.reject(reason);
				});
			}
		}

		return d.promise;
	};

	var _getDependency = function(query, version) {

		var d = $q.defer();

		if(!query) {
			d.reject('No Query');
		}else{
			
			$http({
				method: 'JSONP',
				url: 'http://64.49.237.155:6900/' + query.toString().toLowerCase(),
				cache: true,
				params: {
					version: version || 'latest',
					callback: 'JSON_CALLBACK'
				}
			})
			.success(function(data) {
				var nodeModule = new NodeModule(data);

				d.resolve(nodeModule);
			})
			.error(function(reason) {
				d.reject(reason);
			});
		}

		return d.promise;
	};	

	var _getDependencies = function(module) {
		var d = $q.defer();

		angular.forEach(module.dependencies, function(value, key) {
			 _getDependency(key, value.toString().replace(/\^/g,''))
				.then(function(result) {
					tree.push(result);
					_getDependencies(result);
				});
		});

		return tree;
	};

	var _startQuest = function(moduleName) {
		tree = [];
		return _getDependencies(HistoryService.getModule(moduleName));
	}

	return {
		getNodeModule: _getNodeModule,
		getDependency: _getDependency,
		getDependencies: _getDependencies,
		startQuest: _startQuest
	};
}])

.factory('HistoryService', ['$localstorage', '$q', function($localstorage, $q) {
	var _saveHistory = function(module) {
		var history = $localstorage.getObject('noble-history');
		var newHistory = [];
		if(history) {
			angular.forEach(history, function(value, key) {
				newHistory.push(value);
			});
		}

		newHistory.push(module);

		if($localstorage.setObject('noble-history', newHistory)){
			return true;
		}

		return false;
	};

	var _getHistory = function() {
		var d = $q.defer();
		var history = $localstorage.getObject('noble-history');

		if(history) {
			d.resolve(history);
		}else{
			d.reject('No Items in History');
		}

		return d.promise;
	};

	var _getModule = function(name) {

		var history = $localstorage.getObject('noble-history');
		var module = false

		angular.forEach(history, function(value, key) {
			if(value.name === name){
				module = value;
			}
		});

		return module;
	};

	return {
		getHistory: _getHistory,
		saveHistory: _saveHistory,
		getModule: _getModule
	}
}])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);