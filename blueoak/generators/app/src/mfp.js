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


module.exports.setMFPDir = function(generator) {
	if (generator.props.projectType  == constants.clientServerChoices.server ||
		generator.props.appType != constants.appTypeChoices.mfp)
		return Promise.resolve();

	// Save the directory where we're going to create the app.
	generator.props.cordovaDirectory = generator.props.cordovaProjectName;
};


module.exports.installMFP = function(generator) {
	if (generator.props.projectType  == constants.clientServerChoices.server ||
		generator.props.appType != constants.appTypeChoices.mfp)
		return Promise.resolve();

	var distDir = path.resolve(path.join(
					'client',
					'dist'
				));

	try {
		fs.mkdirSync(distDir);
	} catch (err) {
		if (err instanceof Error && err.code != 'EEXIST') {
			generator.log(chalk.red.bold("Couldn't create directory: " + distDir));
			generator.env.error("Couldn't create directory: " + distDir);
			return Promise.reject("Couldn't create directory: " + distDir);
		}
	}

	generator.log(chalk.yellow('Adding MFP environments: ' + generator.props.cordovaProjectName + ' : ' + generator.props.cordovaPackageName));

	var environments = [];
	if (generator.props.isCordovaIOS) {
		environments.push('ios');

		var iosFile = {
			src: '.gitkeep',
			dest: 'client/' + generator.props.cordovaProjectName + '/platforms/ios/www/.gitkeep'
		};
		generator.fs.copy(generator.templatePath(iosFile.src), generator.destinationPath(iosFile.dest));
	}
	if (generator.props.isCordovaAndroid) {
		environments.push('android');

		var androidFile = {
			src: '.gitkeep',
			dest: 'client/' + generator.props.cordovaProjectName + '/platforms/android/assets/.gitkeep'
		};
		generator.fs.copy(generator.templatePath(androidFile.src), generator.destinationPath(androidFile.dest));
	}

	var theProcess = procSpawn('mfp', ['cordova', 'create', generator.props.cordovaProjectName, '--id', generator.props.cordovaPackageName, '--platform', environments.join(',')], {
		cwd: 'client',
		printCommand: true,
		stdio: 'inherit'
	});
	return theProcess.then(
		null,

		function(err) {
			generator.log(chalk.red.bold('MFP cordova create error: ' + err));
			generator.env.error('MFP cordova create error: ' + err);
		}
	);
};
