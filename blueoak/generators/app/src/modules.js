/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var _ = require('lodash');
var constants = require('../../../common/constants');

module.exports = function(BlueOakGenerator) {
	/**
	 * Compute Angular's module to load and format the dependency list to insert
	 */
	BlueOakGenerator.prototype.computeModules = function() {
		if (this.props.projectType === constants.clientServerChoices.server)
      		return;

		var ngModules = this.props.angularModules.map(function(module) {
			return module.module;
		});

		ngModules = ngModules.concat([
			'ui.router'
		]);

		this.modulesDependencies = ngModules
			.filter(_.isString)
			.map(function(dependency) {
				return '\'' + dependency + '\'';
			})
			.join(', ');
	};

	/**
	 * Simplify the model to simplify access to angular modules from the templates
	 */
	BlueOakGenerator.prototype.prepareAngularModules = function() {
		if (this.props.projectType === constants.clientServerChoices.server)
			return;

		this.angularModulesObject = {};

		this.props.angularModules.forEach(function(module) {
			this.angularModulesObject[module.key] = module.module;
		}, this);
	};
};
