/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var appTypeChoices = {
	spa: 'SPA only',
	mfp: 'SPA and IBM MobileFirst Platform Foundation application',
	cordova: 'SPA and Cordova hybrid application'
};

var clientServerChoices = {
	client: 'Client-side Only',
	server: 'Server-side Only',
	both: 'Full Stack'
};

exports.appTypeChoices = appTypeChoices;
exports.clientServerChoices = clientServerChoices;
