/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function(){
	'use strict';

	angular
		.module('app.locator')
		.controller('LocatorController', LocatorController);

	LocatorController.$inject = ['$scope', '$log'];

	function LocatorController ($scope, $log) {
		var vm = this;

		var locationInfo = {
			location: {
				name: '',
				coordinates: {}
			}
		};

		$scope.$on('locationFailure', locationFailure);

		function locationFailure () {
			$log.log('Failed to get location info');
			vm.locationFailure = true;
		}

		function closeAlert () {
			vm.locationFailure = false;
		}

		angular.extend(vm, {
			locationInfo: locationInfo,
			closeAlert: closeAlert
		});

	}
})();
