/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.generators.Base.extend({

  writing: function () {

    this.bowerInstall('psaf-locator', {'save': true, cwd: './client'});

    this.fs.copy(
      this.templatePath('locator.module.js'),
      this.destinationPath('src/app/locator/locator.module.js')
    );

    this.fs.copy(
      this.templatePath('locator.controller.js'),
      this.destinationPath('src/app/locator/locator.controller.js')
    );

    this.fs.copy(
      this.templatePath('locator.html'),
      this.destinationPath('src/app/locator/locator.html')
    );

    this.fs.copy(
      this.templatePath('locator.route.js'),
      this.destinationPath('src/app/locator/locator.route.js')
    );
  }
});
