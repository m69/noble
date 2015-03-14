angular.module('noble.services', [])

.factory('NodeModule', [function() {
	// constructor with class name
	function NodeModule(config) {
		this.name = config.name || null;
		this.version = config.version || null;
		this.versions = config.versions || null;
		this.preferGlobal = config.preferGlobal || false;
		this.description = config.description || null;
		this.homepage = config.homepage || null;
		this.keywords = config.keywords || null;
		this.repository = config.repository || null;
		this.author = config.author || null;
		this.license = config.license || null;
		this.dependencies = config.dependencies || null;
		this.bugs = config.bugs || null;
		this._id = config._id || null;
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

.factory('Settings', ['$localstorage', function($localstorage) {
	
	var settingsKey = 'noble-settings';

	var settingsConfig = {
		server: 'http://64.49.237.155:6901/'
	}

	var _getSettings = function() {
		var settings = $localstorage.getObject(settingsKey);

		if(settings){
			return settings;
		}else{
			_setSettings(settingsConfig);
			return settings;
		}
	};

	var _setSettings = function(settings) {
		if(settings) {
			$localstorage.setObject(settingsKey, settings);
		}
	};

	return {
		getSettings: _getSettings,
		setSettings: _setSettings
	}

}])

.factory('NobileServer', ['$q', '$http', '$localstorage', 'NodeModule', 'HistoryService', function($q, $http, $localstorage, NodeModule, HistoryService) {

	var nobleServerUrl = 'http://64.49.237.155:6901/';
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
					url: nobleServerUrl + 'retrieve/' + query.toString().toLowerCase(),
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

	var _getNodeModuleDependencies = function(query, version) {

		var d = $q.defer();

		if(!query) {
			d.reject('No Query');
		}else{

			$http({
				method: 'JSONP',
				url: nobleServerUrl + 'resolve/' + query.toString().toLowerCase(),
				cache: true,
				params: {
					version: version || 'latest',
					callback: 'JSON_CALLBACK'
				}
			})
			.success(function(data) {

				d.resolve(data);

			})
			.error(function(reason) {
				d.reject(reason);
			});
		}

		return d.promise;
	};

	var _getDependency = function(query, version) {

		var d = $q.defer();

		if(!query) {
			d.reject('No Query');
		}else{
			
			var params = {
				callback: 'JSON_CALLBACK'
			};

			if(version) {
				params.version = version;
			}

			$http({
				method: 'JSONP',
				url: nobleServerUrl + query.toString().toLowerCase(),
				cache: true,
				params: params
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
	};

	var _getReport = function(url) {

		var d = $q.defer();

		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onInitFs() {

    		var uri = encodeURI(url);
			var filename = uri.substring(uri.lastIndexOf('/')+1);
			var fileUrl = 'cdvfile://localhost/persistent/' + filename;

			var fileTransfer = new FileTransfer();

			fileTransfer.download(
			    uri,
			    fileUrl,
			    function(entry) {
			        console.log("download complete: " + entry.toURL());
			        d.resolve(entry);
			        _saveReport(entry);
			    },
			    function(error) {
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			        d.reject(error);
			    }
			);

    	}, function errorHandler(e) {
    		
    	var msg = '';

		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
		  };

		  console.log('Error: ' + msg);
    	});

		return d.promise;

	};

	var _saveReport = function(report) {
		var reportsKey = 'noble-reports';

		var reports = $localstorage.getObject(reportsKey);
		var newReports = [];
		
		if(reports) {
			angular.forEach(reports, function(value, key) {
				newReports.push(value);
			});
		}

		newReports.push(report);

		if($localstorage.setObject(reportsKey, newReports)){
			return true;
		}

		return false;
	}

	return {
		getNodeModule: _getNodeModule,
		getDependency: _getDependency,
		getDependencies: _getDependencies,
		startQuest: _startQuest,
		getNodeModuleDependencies: _getNodeModuleDependencies,
		getReport: _getReport,
		saveReport: _saveReport
	};
}])

.factory('HistoryService', ['$localstorage', '$q', function($localstorage, $q) {

	var nobleStorageKey = 'noble-app';

	var _saveHistory = function(module) {
		var history = $localstorage.getObject(nobleStorageKey);
		var newHistory = [];
		if(history) {
			angular.forEach(history, function(value, key) {
				newHistory.push(value);
			});
		}

		newHistory.push(module);

		if($localstorage.setObject(nobleStorageKey, newHistory)){
			return true;
		}

		return false;
	};

	var _getHistory = function() {
		var d = $q.defer();
		var history = $localstorage.getObject(nobleStorageKey);

		if(history) {
			d.resolve(history);
		}else{
			d.reject('No Items in History');
		}

		return d.promise;
	};

	var _getModule = function(name) {

		var history = $localstorage.getObject(nobleStorageKey);
		var module = false

		angular.forEach(history, function(value, key) {
			if(value.name === name){
				module = value;
			}
		});

		return module;
	};

	var _deleteModule = function(module) {

		var d = $q.defer();

		var history = $localstorage.getObject(nobleStorageKey);
		var newHistory = [];

		if(history) {
			angular.forEach(history, function(value, key) {
				if(value.name.toString() !== module.name.toString() && value.version.toString() !== module.version.toString()){
					newHistory.push(value);
				}
			});

			$localstorage.setObject(nobleStorageKey, newHistory);
			d.resolve(newHistory);
		}else{
			d.reject(false);
		}

		return d.promise;
	};

	var _clearHistory = function() {

		var d = $q.defer();

		$localstorage.setObject(nobleStorageKey, []);

		if($localstorage.getObject(nobleStorageKey).length === 0) {
			d.resolve(true);
		}else{
			d.reject(false);
		}

		return d.promise;
	};

	var _getReports = function() {
		var reportsKey = 'noble-reports';

		var d = $q.defer();

		var reports = $localstorage.getObject(reportsKey);

		if(reports) {
			d.resolve(reports);
		}else{
			d.reject('No Reports');
		}

		return d.promise;
	};

	var _getReport = function(name) {
		var reportsKey = 'noble-reports';

		var reports = $localstorage.getObject(reportsKey);
		var report;

		angular.forEach(reports, function(value, key){
			if(value.name === name) {
				report = value;
			};
		});

		return report || false;
	};

	var _deleteReport = function(name) {
		var reportsKey = 'noble-reports';

		var d = $q.defer();

		var reports = $localstorage.getObject(reportsKey);
		var newReports = [];
		var file = false;

		angular.forEach(reports, function(value, key){
			if(value.name === name) {
				console.log('found: ' + name);
				file = true;
			}else{
				console.log('pushing: ' + value.name);
				newReports.push(value);
			}
		});

		if(file && cordova.plugins) {
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onInitFs(fs) {
	    		console.log('onInitFs');
	    		console.log(name);
	    		fs.root.getFile(name, {}, function(fileEntry) {
	    			console.log('fileEntry');
	    			fileEntry.remove(function(success){
	    				console.log('removed');
	    				$localstorage.setObject(reportsKey, newReports);
	    				d.resolve(newReports);
	    			},function errorHandler(e){
	    				d.reject(e);
	    			});

				  },function errorHandler(e){
	    				d.reject(e);
	    		});

	    	},function errorHandler(e){
				d.reject(e);
			});
		}

		return d.promise;
	};

	return {
		getHistory: _getHistory,
		saveHistory: _saveHistory,
		getModule: _getModule,
		deleteModule: _deleteModule,
		clearHistory: _clearHistory,
		getReports: _getReports,
		getReport: _getReport,
		deleteReport: _deleteReport
	}
}])

.factory('EmailService', ['$window', '$localstorage', 'HistoryService', function($window, $localstorage, HistoryService){
	
	var _sendEmail = function(name) {

		var report = HistoryService.getReport(name);

		if(report && cordova.plugins) {
			cordova.plugins.email.isAvailable(function (isAvailable) {

			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onInitFs(fs) {

	    		fs.root.getFile(name, {}, function(fileEntry) {

	    			var attachments = [];
					attachments.push(fileEntry.toURL());
						
					cordova.plugins.email.open({
							attachments: attachments,
							subject: 'Noble Reports',
							body: '###Noble###',
							isHtml: true
						});
					});

				  }, function errorHandler(e){console.log(e)});

	    	}, function errorHandler(e) {
	    		
	    	var msg = '';

			  switch (e.code) {
			    case FileError.QUOTA_EXCEEDED_ERR:
			      msg = 'QUOTA_EXCEEDED_ERR';
			      break;
			    case FileError.NOT_FOUND_ERR:
			      msg = 'NOT_FOUND_ERR';
			      break;
			    case FileError.SECURITY_ERR:
			      msg = 'SECURITY_ERR';
			      break;
			    case FileError.INVALID_MODIFICATION_ERR:
			      msg = 'INVALID_MODIFICATION_ERR';
			      break;
			    case FileError.INVALID_STATE_ERR:
			      msg = 'INVALID_STATE_ERR';
			      break;
			    default:
			      msg = 'Unknown Error';
			      break;
			  };

			  console.log('Error: ' + msg);
	    	});

		}
	};

	return {
		sendEmail: _sendEmail
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
      return JSON.parse($window.localStorage[key] || null);
    }
  }
}]);