/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var generatorBaseClass = require('../../common/generatorBaseClass');
var angularModuleUtilities = require('../../common/angularModuleUtilities');

var moduleSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.Base, {
	_initialize: function() {
		this.argument('name', { type: String, required: false });
	},

	default: function() {
		// if the module name is suffixed with module, remove it
		if (this.name && this.name.substr(-6).toLowerCase() === 'module')
			this.name = this.name.slice(0, -6);

		// Priority of module name:
		// 1. Taken from the generator's command line argument
		// 2. Inferred from CWD if CWD is under src/app
		var moduleName = this.name || angularModuleUtilities.getModuleNameFromCWD(this.destinationRoot());
		if (!moduleName)
			this.env.error('No module name was specified');

		var moduleFiles = this._getModuleContents(moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}
	}
});

angularModuleUtilities.withModuleNameMixin(moduleSubgeneratorClass);

module.exports = moduleSubgeneratorClass;
