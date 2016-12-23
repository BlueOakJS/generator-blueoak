/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var pkg = require('../../package.json');
var constants = require('../../common/constants');

var GulpAngularGenerator = yeoman.generators.Base.extend({
	constructor: function() {
		yeoman.generators.Base.apply(this, arguments);

		// Define arguments
		this.argument('appName', {
			type: String,
			required: false,
			default: this.determineAppname()
		});

		this.props = {
			version: pkg.version
		};

    this.constants = constants;
	},

	/**
	* Shows yeoman says his greatings unless the skip option is set
	*/
	info: function() {
		if (!this.options['silent']) {
			this.log(yosay(
				chalk.blue('PointSource BlueOak') + ' Crushing the sickest apps since 2016'
			));
		}
	}
});

require('./src/options')(GulpAngularGenerator);
require('./src/prompts')(GulpAngularGenerator);
require('./src/paths')(GulpAngularGenerator);
require('./src/files')(GulpAngularGenerator);

require('./src/modules')(GulpAngularGenerator);
require('./src/router')(GulpAngularGenerator);
require('./src/bower')(GulpAngularGenerator);

require('./src/install')(GulpAngularGenerator);

require('./src/write')(GulpAngularGenerator);

module.exports = GulpAngularGenerator;
