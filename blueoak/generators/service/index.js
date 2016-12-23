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
var serviceSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	createServiceFiles: function() {
		// if the service name is suffixed with service, remove the suffix
		if (this.name.substr(-7).toLowerCase() === 'service')
			this.name = this.name.slice(0, -7);

		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.serviceName = _.capitalize(_.camelCase(this.name)) + 'Service';
		this.serviceFileName = _.kebabCase(this.name) + '.service.js';

		this.fs.copyTpl(
			this.destinationPath(path.join(
				'client',
				'.templates',
				'service.js'
			)),
			this.destinationPath(path.join(
				rootDirectory,
				this.moduleNameProperties.moduleDirectoryName,
				this.serviceFileName
			)),
			this
		);
	}
});

angularModuleUtilities.withModuleNameMixin(serviceSubgeneratorClass);

module.exports = serviceSubgeneratorClass;
