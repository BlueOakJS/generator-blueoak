/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var yeoman = require('yeoman-generator');
var path = require('path');

var destDirectory = path.join('client', 'src', 'assets', 'scss');

module.exports = yeoman.generators.Base.extend({
  writing: function() {
		this._installBlueOakUi();

		this._copySCSS();

		this.overrideFoundationSitesMain();
	},

  _installBlueOakUi: function() {
    this.bowerInstall(['blueoak-ui#*'], {
			save: true,
			cwd: './client'
		});
  },

  _copySCSS: function() {
  	// Add sass file to src/assets/scss which
		// @imports bower_components/sprout-ui/scss/blue-oak-ui-default.scss
		// so that it gets compiled in the @pointsource/buildoak-build process
		this.fs.copy(
			this.sourceRoot() + '/index.scss',
			destDirectory + '../app/index.scss'
		);

		this.fs.copy(
			this.sourceRoot() + '/_foundation-settings.scss',
			destDirectory + '/foundation-settings.scss'
		);

		this.fs.copy(
			this.sourceRoot() + '/_blueoak-ui-settings.scss',
			destDirectory + '/blueoak-ui-settings.scss'
		);
  },

  // This overrides the default bower.json 'main' for FFS6 which causes
  // wire-deps to override the blueoak Foundation style settings.
  overrideFoundationSitesMain: function () {
		var bowerJSON = this.fs.readJSON(this.destinationPath(path.join('client', 'bower.json')));
		if (bowerJSON.overrides == undefined)
			bowerJSON.overrides = {};
		bowerJSON.overrides['foundation-sites'] = {
			main: [
				'dist/foundation.js'
			]
		};
		this.fs.writeJSON(this.destinationPath(path.join('client', 'bower.json')), bowerJSON);
	}

});
