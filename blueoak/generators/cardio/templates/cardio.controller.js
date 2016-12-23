/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

		function onCardIOComplete(response) {
			vm.cardioresp = response;
			$scope.$apply();
		}

		function onCardIOCancel() {
			console.log("card.io scan cancelled");
		}

		vm.scan = function(e) {
			CardIO.scan({
				"expiry": true,
				"cvv": true,
				"zip": true,
				"suppressManual": false,
				"suppressConfirm": false,
				"hideLogo": true
			},
			onCardIOComplete,
			onCardIOCancel
			);
		}

		function init() {
			vm.scanmsg = 'Scan Now!';

			CardIO.version(function(ret) {
				vm.cardioVersion = ret;
				$scope.$apply();
			});

			CardIO.canScan(function(canScan) {
				if (!canScan)
					vm.scanmsg = 'Manual entry';
				$scope.$apply();
			});
		}

		init();
