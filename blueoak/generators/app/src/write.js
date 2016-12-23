/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var chalk = require('chalk');
var utils = require('./utils');
var constants = require('../../../common/constants');

module.exports = function(BlueOakGenerator) {
	/**
	 * Pass through each files and actually copy them
	 */
	BlueOakGenerator.prototype.writing = function() {
		this.files.forEach(function(file) {
			if (skipFile(this.props.projectType, file.src))
				return;

			try {
				if (file.template) {
					this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest), this);
				} else {
					this.fs.copy(this.templatePath(file.src), this.destinationPath(file.dest));
				}
			} catch (error) {
				console.error('Template processing error on file', file.src);
				throw error;
			}
		}, this);
	};

	/**
	 * End message
	 */
	BlueOakGenerator.prototype.end = function() {
		this.config.set(this.props);

		if (this.props.projectType === constants.clientServerChoices.server)
			return;

		this.log('It\'s time to use Gulp tasks:');
		this.log('- `$ ' + chalk.yellow.bold('gulp build-spa') + '` to build a development version of your application in folder dist');
		this.log('- `$ ' + chalk.yellow.bold('gulp serve-spa') + '` to start BrowserSync server on your source files with live reload');
		this.log('- `$ ' + chalk.yellow.bold('gulp serve-spa --release') + '` to start BrowserSync server on your optimized application without live reload');
		this.log('\nMore details are available in the wiki');
		this.log('https://github.com/PointSource/generator-blueoak/wiki/BlueOak-Quickstart-Guide');
	};

	function skipFile(type, file) {
		if (type === constants.clientServerChoices.client && /^(server\/)/.test(file) ||
			type === constants.clientServerChoices.server && /^(client\/)/.test(file))
			return true;

		return false;
	}
};
