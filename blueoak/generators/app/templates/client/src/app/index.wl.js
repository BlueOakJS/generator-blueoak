(function(){
	'use strict';


	/* global WL */

	/* eslint-disable no-unused-vars, angular/window-service */
	window.wlInitOptions = {
	/* eslint-enable no-unused-vars */
		// Options to initialize with the WL.Client object.
		// For initialization options please refer to IBM MobileFirst Platform Foundation Knowledge Center.
	};

	// Called automatically after MFP framework initialization by WL.Client.init(wlInitOptions).
	/* eslint-disable no-unused-vars, angular/log, no-console */
	window.wlCommonInit = function() {
	/* eslint-enable no-unused-vars */
		// Common initialization code goes here
		console.log('common init', WL.Client.getAppProperty('APP_VERSION'));

		startAngular();
	};

	// Called automatically after MFP framework initialization by WL.Client.init(wlInitOptions).
	function startAngular() {
		angular.element(document).ready(
			function() {
				// Angular bootstrap starts the application
				angular.bootstrap(document, ['app'], {
					strictDi: true
				});
			}
		);
	}

	/* eslint-disable angular/document-service */
	// MFP automatically calls wlCommonInit() above after it's initialized.
	if (window.platformType == 'cordova') {
		document.addEventListener('deviceready', startAngular, false);
	} else if (window.platformType == 'spa') {
		startAngular();
	}
})();
