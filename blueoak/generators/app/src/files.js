/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');

var files = require('../files.json');

/**
 * Take a template file path and create a copy description object
 * Look for the js preprocessor equivalent file and use it if exist
 */
function resolvePaths(template) {
	return function(file) {
		var src = file,
        dest;

    if(/\w+(-package.json)/.test(file)) {
      dest = 'package.json';
    } else {
      dest = file;
    }

		// Remove any globbing from the destintion path.
		while (path.basename(dest).indexOf("*") != -1) {
			dest = path.dirname(dest);
		}

		return {
			src: src,
			dest: dest,
			template: template
		};
	};
}

module.exports = function(BlueOakGenerator) {

	/**
	 * Prepare all files from files.json and add them to `this.files` as
	 * copy description object
	 */
	BlueOakGenerator.prototype.prepareFiles = function() {
		this.files = []
			.concat(files.staticFiles.map(resolvePaths(false), this))
			.concat(files.templates.map(resolvePaths(true), this));
	};
};
