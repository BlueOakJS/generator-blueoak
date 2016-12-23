/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

		/* global cordova */

		function onScanComplete(response) {
			vm.error = null;
			vm.barcodeResponse = response;
			$scope.$apply();
		}

		function onScanFail(error) {
			vm.error = error;
			$scope.$apply();
		}

		vm.scan = function() {
			cordova.plugins.barcodeScanner.scan(
				onScanComplete,
				onScanFail
			);
		};

		function init() {
			vm.scanmsg = 'Scan Now!';
		}

		init();
