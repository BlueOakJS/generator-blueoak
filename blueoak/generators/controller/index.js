/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var generatorBaseClass = require('../../common/generatorBaseClass');
var angularModuleUtilities = require('../../common/angularModuleUtilities');

var rootDirectory = path.join(
						'client',
						'src',
						'app'
					);

var controllerSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	default: function() {
		// if the controller name is suffixed with controller, remove the suffix
		if (this.name.substr(-10).toLowerCase() === 'controller')
			this.name = this.name.slice(0, -10);

		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.controllerName = _.capitalize(_.camelCase(this.name)) + 'Controller';
		this.controllerFileName = _.kebabCase(this.name) + '.controller.js';

		this.fs.copyTpl(
			this.destinationPath(path.join(
				'client',
				'.templates',
				'controller.js'
			)),
			this.destinationPath(path.join(
				rootDirectory,
				this.moduleNameProperties.moduleDirectoryName,
				this.controllerFileName
			)),
			this
		);
	}
});

angularModuleUtilities.withModuleNameMixin(controllerSubgeneratorClass);

module.exports = controllerSubgeneratorClass;
