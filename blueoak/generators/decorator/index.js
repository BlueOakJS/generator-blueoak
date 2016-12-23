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

var decoratorSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	createServiceFiles: function() {
		// if the decorator name is suffixed with decorator, remove the suffix
		if (this.name.substr(-9).toLowerCase() === 'decorator')
			this.name = this.name.slice(0, -9);

		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.serviceName = _.capitalize(_.camelCase(this.name)) + 'Service';
		this.decoratorName = _.capitalize(_.camelCase(this.name)) + 'Decorator';
		this.decoratorFileName = _.kebabCase(this.name) + '.decorator.js';

		this.fs.copyTpl(
			this.destinationPath(path.join(
				'client',
				'.templates',
				'decorator.js'
			)),
			this.destinationPath(path.join(
				rootDirectory,
				this.moduleNameProperties.moduleDirectoryName,
				this.decoratorFileName
			)),
			this
		);
	}
});

angularModuleUtilities.withModuleNameMixin(decoratorSubgeneratorClass);

module.exports = decoratorSubgeneratorClass;
