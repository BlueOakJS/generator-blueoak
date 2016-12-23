/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var cordova = require('./cordova');
var mfp = require('./mfp');
var chalk = require('chalk');
var constants = require('../../../common/constants');

/**
 * Launch npm and bower installs unless they are skipped
 */
function npmAndBowerInstall(generator) {
	if (generator.props.projectType === constants.clientServerChoices.server) {
		generator.npmInstall(null, { cwd: './server' });
	} else if (generator.props.projectType === constants.clientServerChoices.client) {
		generator.npmInstall(null, { cwd: './client' });
		generator.bowerInstall(null, { cwd: './client' });
	} else {
		generator.npmInstall(null, { cwd: './client' });
		generator.bowerInstall(null, { cwd: './client' });
		generator.npmInstall(null, { cwd: './server' });
	}
};

module.exports = function(BlueOakGenerator) {
	BlueOakGenerator.prototype.setAppDir = function() {
		cordova.setCordovaDir(this);
		mfp.setMFPDir(this);
	};

	BlueOakGenerator.prototype.install = function() {
		var done = this.async();

		cordova.installCordova(this).then(
			function() {
				return mfp.installMFP(this);
			}.bind(this)
		).then(
			function() {
				this.log(chalk.yellow("Installing NPM and Bower dependencies"));
				npmAndBowerInstall(this);
				done();
			}.bind(this)
		);
	};
}
