(function() {
    'use strict';

    angular
        .module('app')
        .run(appRun);

	appRun.$inject = [
		'$log',
        '$rootScope',
        '$document',
        '$timeout',
		'$urlRouter',
		'$state',
		'MfpConnectService'
	];

	function appRun($log, $rootScope, $document, $timeout, $urlRouter, $state, MfpConnectService) {
        var destroyStateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function initFoundation() {
                $document.foundation();
            });
        });

        $rootScope.$on('$destroy', function () {
            destroyStateChangeListener();
        });

		MfpConnectService.connectToMFP().then(
			null,

			function(reason) {
				$log.log('App disabled: ', reason);
			}
		).then(
			function() {
				// Set the initial state here.
				$state.go('home');

				$urlRouter.listen();
			}
		);
	}
})();
