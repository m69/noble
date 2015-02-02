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

.factory('NpmService', ['$q', '$http', 'NodeModule', function($q, $http, NodeModule) {

	var tree = [];

	var _getNodeModule = function(query, version) {

			var d = $q.defer();

			if(!query) {
				d.reject('No Query');
			}else{

				$http({
					method: 'JSONP',
					url: 'http://64.49.237.155:6900/' + query,
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
				 _getNodeModule(key, value.toString().replace(/\^/g,''))
					.then(function(result) {
						tree.push(result);
						_getDependencies(result);
					});
			});

			return tree;
		}

	return {
		getNodeModule: _getNodeModule,
		getDependencies: _getDependencies
	};
}]);