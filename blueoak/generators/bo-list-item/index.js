/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var yeoman = require('yeoman-generator');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  writing: function() {
		this._installHammerJS();
	},

  _installHammerJS: function() {
    this.bowerInstall(['hammerjs#2.0.6'], {
			save: true,
			cwd: './client'
		});
  }
});
