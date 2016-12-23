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

var directiveSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	createDirectiveFiles: function() {
		// if the directive name is suffixed with directive, remove the suffix
		if (this.name.substr(-9).toLowerCase() === 'directive')
			this.name = this.name.slice(0, -9);

		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.directiveName = _.camelCase(this.name);
		this.directiveFunctionName = _.capitalize(_.camelCase(this.name)) + 'Directive';
		this.directiveFileName = _.kebabCase(this.name) + '.directive.js';

		this.fs.copyTpl(
			this.destinationPath(path.join(
				'client',
				'.templates',
				'directive.js'
			)),
			this.destinationPath(path.join(
				rootDirectory,
				this.moduleNameProperties.moduleDirectoryName,
				this.directiveFileName
			)),
			this
		);
	}
});

angularModuleUtilities.withModuleNameMixin(directiveSubgeneratorClass);

module.exports = directiveSubgeneratorClass;
