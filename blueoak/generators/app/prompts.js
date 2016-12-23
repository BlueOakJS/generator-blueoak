/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var constants = require('../../common/constants');

var serverSideOrFullStack = function(props) {
	return props.projectType === constants.clientServerChoices.both || props.projectType === constants.clientServerChoices.server;
};

var clientSideOnly = function(props) {
	return props.projectType === constants.clientServerChoices.client;
};

var clientSideOrFullStack = function(props) {
	return props.projectType === constants.clientServerChoices.client || props.projectType === constants.clientServerChoices.both;
};

var initialPrompts = [
	{
		type: 'list',
		name: 'projectType',
		message: 'What type of project should this be?',
		choices: [
			constants.clientServerChoices.client,
			constants.clientServerChoices.server,
			constants.clientServerChoices.both
		],
		default: 2
	}
];

var serverPrompts = [
	{
		name: 'projectName',
		message: 'What would you like to call this project?',
		default: 'node-ref',
		when: serverSideOrFullStack
	},
	{
		name: 'projectDesc',
		message: 'What is the purpose of this project?',
		default: 'Node reference implementation',
		when: serverSideOrFullStack
	},
	{
		name: 'nodePort',
		message: 'What port would you like the server to run on?',
		default: '3000',
		validate: function(input) {
			if (isNaN(input))
				return 'You need to provide a number';

			return true;
		},
		when: serverSideOrFullStack
	}
];

var clientPrompts = [
	{
		type: "checkbox",
		name: "angularModules",
		message: "What Angular modules would you like to have?",
		choices: [
			{
				value: {
					key: "animate",
					module: "ngAnimate"
				},
				name: "angular-animate.js (enable animation features)",
				checked: true
			},
			{
				value: {
					key: "cookies",
					module: "ngCookies"
				},
				name: "angular-cookies.js (handle cookie management)",
				checked: true
			},
			{
				value: {
					key: "touch",
					module: "ngTouch"
				},
				name: "angular-touch.js (for mobile development)",
				checked: true
			},
			{
				value: {
					key: "sanitize",
					module: "ngSanitize"
				},
				name: "angular-sanitize.js (to securely parse and manipulate HTML)",
				checked: true
			},
			{
				value: {
					key: "messages",
					module: "ngMessages"
				},
				name: "angular-messages.js (enhanced support for displaying messages within templates)",
				checked: true
			},
			{
				value: {
					key: "aria",
					module: "ngAria"
				},
				name: "angular-aria.js (support for common ARIA attributes)",
				checked: true
			}
		],
		when: clientSideOrFullStack
	},
	{
		type: 'list',
		name: 'appType',
		message: 'What type of client-side application should this be?',
		choices: [
			constants.appTypeChoices.spa,
			constants.appTypeChoices.mfp,
			constants.appTypeChoices.cordova
		],
		default: 1,
		when: clientSideOrFullStack
	},
	{
		name: 'cordovaProjectName',
		message: 'What is the app name? (should be 1 word)',
		when: function(answers) {
			return answers.appType == constants.appTypeChoices.mfp || answers.appType == constants.appTypeChoices.cordova;
		}
	},
	{
		name: 'cordovaPackageName',
		message: 'What is the app ID? (reverse-domain-style name: com.company.Name)',
		when: function(answers) {
			return answers.appType == constants.appTypeChoices.mfp || answers.appType == constants.appTypeChoices.cordova;
		},
		default: 'com.pointsource.someNewApp'
	},
	{
		type: 'confirm',
		name: 'isCordovaIOS',
		message: 'Should the hybrid app run on iOS?',
		when: function(answers) {
			return answers.appType == constants.appTypeChoices.mfp || answers.appType == constants.appTypeChoices.cordova;
		}
	},
	{
		type: 'confirm',
		name: 'isCordovaAndroid',
		message: 'Should the hybrid app run on Android?',
		when: function(answers) {
			return answers.appType == constants.appTypeChoices.mfp || answers.appType == constants.appTypeChoices.cordova;
		}
	}
];

exports.prompts = initialPrompts.concat(serverPrompts, clientPrompts);
