angular.module('noble.services', [])

.factory('NodeModule', [function() {
	// constructor with class name
	function NodeModule(config) {
		this.name = config.data.name || null;
		this.version = config.data.version || null;
		this.preferGlobal = config.data.preferGlobal || false;
		this.description = config.data.description || null;
		this.homepage = config.data.homepage || null;
		this.keywords = config.data.keywords || null;
		this.repository = config.data.repository || null;
		this.author = config.data.author || null;
		this.license = config.data.license || null;
		this.dependencies = config.data.dependencies || null;
		this.bugs = config.data.bugs || null;
		this.id = config.data._id || null;
		this.npmVersion = config.data._npmVersion || null;
		this.nodeVersion = config.data._nodeVersion || null;
		this.maintainers = config.data.maintainers || null;
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
	return {
		getNodeModule: function(query) {

			var d = $q.defer();

			if(!query) {
				d.reject('No Query');
			}else{
				$http({
					method: 'JSONP',
					url: 'https://registry.npmjs.com/' + query + '/latest?JSON_CALLBACK'
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
		}
	};
}]);