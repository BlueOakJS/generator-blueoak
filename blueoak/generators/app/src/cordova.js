/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var procSpawn = require('superspawn').spawn;
var Promise = require('bluebird');
var constants = require('../../../common/constants');


module.exports.setCordovaDir = function(generator) {
	if (generator.props.projectType  == constants.clientServerChoices.server ||
		generator.props.appType != constants.appTypeChoices.cordova)
		return;

	// Save the directory where we're going to create the app.
	generator.props.cordovaDirectory = 'cordova';
};


module.exports.installCordova = function(generator) {
	if (generator.props.projectType  == constants.clientServerChoices.server ||
		generator.props.appType != constants.appTypeChoices.cordova)
		return Promise.resolve();

	var distDir = path.resolve(path.join(
					'client',
					'dist'
				));

	var cordovaDir = path.join('client/cordova');



	try {
		fs.mkdirSync(distDir);
	} catch (err) {
		if (err instanceof Error && err.code != 'EEXIST') {
			generator.log(chalk.red.bold("Couldn't create directory: " + distDir));
			generator.env.error("Couldn't create directory: " + distDir);
			return Promise.reject("Couldn't create directory: " + distDir);
		}
	}

	generator.log(chalk.yellow('Adding Cordova environments: ' + generator.props.cordovaProjectName + ' : ' + generator.props.cordovaPackageName));

	var theProcess = procSpawn('cordova', ['create', 'cordova', generator.props.cordovaPackageName, generator.props.cordovaProjectName, '--template', distDir], {
		cwd: 'client',
		printCommand: true,
		stdio: 'inherit'
	});
	return theProcess.then(
		function() {
			if (generator.props.isCordovaIOS) {
				generator.log(chalk.yellow('Adding IOS Cordova environment'));

				var iosFile = {
					src: '.gitkeep',
					dest: 'client/cordova/platforms/ios/www/.gitkeep'
				};
				generator.fs.copy(generator.templatePath(iosFile.src), generator.destinationPath(iosFile.dest));

				return procSpawn('cordova', ['platform', 'add', 'ios'], {
					cwd: cordovaDir,
					printCommand: true,
					stdio: 'inherit'
				});
			}
		},

		function(err) {
			generator.log(chalk.red.bold('Cordova create error: ' + err));
			generator.env.error('Cordova create error: ' + err);
		}
	).then(
		function() {
			if (generator.props.isCordovaAndroid) {
				generator.log(chalk.yellow('Adding Android Cordova environment'));

				var androidFile = {
					src: '.gitkeep',
					dest: 'client/cordova/platforms/android/assets/.gitkeep'
				};
				generator.fs.copy(generator.templatePath(androidFile.src), generator.destinationPath(androidFile.dest));

				return procSpawn('cordova', ['platform', 'add', 'android'], {
					cwd: cordovaDir,
					printCommand: true,
					stdio: 'inherit'
				});
			}
		},

		function(err) {
			generator.log(chalk.red.bold('Cordova add ios error: ' + err));
			generator.env.error('Cordova add ios error: ' + err);
		}
	).then(
		function() {
			generator.log(chalk.yellow('Adding Splashscreen Cordova plugin'));
			return procSpawn('cordova', ['plugin', 'add', 'cordova-plugin-splashscreen'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		},

		function(err) {
			generator.log(chalk.red.bold('Cordova add android error: ' + err));
			generator.env.error('Cordova add android error: ' + err);
		}
	).then(
		null,

		function(err) {
			generator.log(chalk.red.bold('Cordova add Splashscreen plugin error: ' + err));
			generator.env.error('Cordova add Splashscreen plugin error: ' + err);
		}
	);
};
