angular.module('noble.controllers', [])

.controller('MenuCtrl', function($scope) {

})
.controller('NobleCtrl', function($scope) {
	$scope.nv = {};
	$scope.nv.values = [
		{name: 'Service'},
		{name: 'Loyalty'},
		{name: 'Honesty'},
		{name: 'Integrity'}
	];
});
