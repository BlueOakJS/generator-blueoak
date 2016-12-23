/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var _ = require('lodash');
var chalk = require('chalk');

var prompts = require('../prompts.js').prompts;


module.exports = function(BlueOakGenerator) {
	/**
	 * Check if there is a .yo-rc.json and ask for using it
	 */
	BlueOakGenerator.prototype.checkYoRc = function() {
		var done = this.async();
		if (this.config.getAll().projectType) {
			this.prompt([{
				type: 'confirm',
				name: 'skipConfig',
				message: 'Existing ' + chalk.green('.yo-rc') + ' configuration found, would you like to use it?',
				default: true
			}], function(answers) {
				this.skipConfig = answers.skipConfig;

				if (answers.skipConfig)
					this.props = _.merge(this.props, this.config.getAll());

				done();
			}.bind(this));
		} else {
			this.skipConfig = false;
			done();
		}
	};

	/**
	 * Ask all questions from prompts.json
	 * Add conditional tests on those depending on first responses
	 * Complete responses with null answers for questions not asked
	 */
	BlueOakGenerator.prototype.askQuestions = function() {
		if (this.skipConfig)
			return;

		var done = this.async();

		this.prompt(prompts, function(props) {
			this.props = _.merge(this.props, props);

			done();
		}.bind(this));
	};
};
