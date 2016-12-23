/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';


module.exports = function(BlueOakGenerator) {
	/**
	 * Configure routing by defining what to add in the index.html and what in the app.js
	 */
	BlueOakGenerator.prototype.computeRouter = function() {
		this.files.push({
			src: 'client/src/app/index.route.js',
			dest: 'client/src/app/index.route.js',
			template: true
		});
	};
};
