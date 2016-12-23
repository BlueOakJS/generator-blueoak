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

var viewSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	createViewFiles: function() {
		// if the view name is suffixed with view, remove it
		if (this.name.substr(-4).toLowerCase() === 'view')
			this.name = this.name.slice(0, -4);

		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.viewFileName = _.kebabCase(this.name) + '.html';

		this.fs.copyTpl(
			this.destinationPath(path.join(
				'client',
				'.templates',
				'view.html'
			)),
			this.destinationPath(path.join(
				rootDirectory,
				this.moduleNameProperties.moduleDirectoryName,
				this.viewFileName
			)),
			this
		);
	}
});

angularModuleUtilities.withModuleNameMixin(viewSubgeneratorClass);

module.exports = viewSubgeneratorClass;
