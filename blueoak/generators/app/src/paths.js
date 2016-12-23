/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var _ = require('lodash');

var utils = require('./utils.js');

var pathOptions = ['app-path', 'dist-path', 'tmp-path'];

module.exports = function(BlueOakGenerator) {
	/**
	 * Check paths options to refuse absolutes ones and normalize them
	 */
	BlueOakGenerator.prototype.checkPaths = function() {
		pathOptions.forEach(function (name) {
			if (utils.isAbsolutePath(this.options[name])) {
				this.env.error(name + ' must be a relative path');
			}
			this.options[name] = utils.normalizePath(this.options[name]);
		}, this);
	};
};
