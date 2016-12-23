/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var process = require('process');
var _ = require('lodash');
var recast = require('recast');
var astTypes = require('ast-types');
var astBuilders = astTypes.builders;
var namedTypes = astTypes.namedTypes;

var cwd = process.cwd();

var rootDirectory = path.join(
						'client',
						'src',
						'app'
					);

function getModuleNamePropertiesFromModuleName(moduleName) {
	if (moduleName != 'app' && moduleName.substr(0, 4).toLowerCase() !== 'app.')
		moduleName = "app." + moduleName;

	var moduleNameComponents = moduleName.split('.');

	var camelizedModuleNameComponents = moduleNameComponents.map(function(moduleNameComponent) {
		return _.camelCase(moduleNameComponent);
	});

	var kebabedModuleNameComponents = moduleNameComponents.map(function(moduleNameComponent) {
		return _.kebabCase(moduleNameComponent);
	});

	var res = {
		moduleDirectoryName: path.posix.join.apply(path, kebabedModuleNameComponents.slice(1)),
		moduleFileName: kebabedModuleNameComponents.slice(-1) + '.module.js',

		moduleName: camelizedModuleNameComponents.join('.'),
		parentModuleName: camelizedModuleNameComponents.slice(0, -1).join('.')
	};

	return res;
};

function getModuleNameFromCWD(destinationRoot) {
	var moduleName;

	var pathRelativeToProjectRoot = path.relative(destinationRoot, cwd);
	var pathArray = pathRelativeToProjectRoot.split(path.sep);
	if (pathArray[0] == 'client' && pathArray[1] == 'src' && pathArray[2] == 'app' && pathArray.length > 3)
		moduleName = pathArray.slice(3).join('.');

	return moduleName;
};

function createModules(moduleName, projectRoot) {
	var moduleNameProperties = getModuleNamePropertiesFromModuleName(moduleName);

	var ret = {};

	var moduleTemplateString = fs.readFileSync(
									path.join(
										projectRoot,
										'client',
										'.templates',
										'module.js'
									)
								);
	var moduleTemplate = _.template(moduleTemplateString);

	// Create modules all the way up the tree if necessary
	while (moduleNameProperties.moduleName != 'app') {
		var filename = path.join(
			rootDirectory,
			moduleNameProperties.moduleDirectoryName,
			moduleNameProperties.moduleFileName
		);

		ret[filename] = moduleTemplate(moduleNameProperties);

		moduleNameProperties = getModuleNamePropertiesFromModuleName(moduleNameProperties.parentModuleName);
	}

	return ret;
};

function addModuleDependency(moduleFile, newDependency) {
	var tree = recast.parse(moduleFile);

	astTypes.visit(tree, {
		visitCallExpression: function(path) {
			function isAngularModule(path) {
				var calleeNode = path.get('callee');
				if (!namedTypes.MemberExpression.check(calleeNode.value))
					return false;

				var objectNode = calleeNode.get('object').value;
				if (!namedTypes.Identifier.check(objectNode) ||
					objectNode.name != 'angular')
					return false;

				var propertyNode = calleeNode.get('property').value;
				if (!namedTypes.Identifier.check(propertyNode) ||
					propertyNode.name != 'module')
					return false;

				return true;
			}

			function isModuleDeclaration(path) {
				var argumentsNode = path.get('arguments').value;
				if (argumentsNode.length < 2)
					return false;
				if (!namedTypes.ArrayExpression.check(argumentsNode[1]))
					return false;

				return true;
			}

			if (!isAngularModule(path) || !isModuleDeclaration(path)) {
				// If it's not the right call, keep looking
				this.traverse(path);
			} else {
				// Found it.. check to see if the dependency is already in the array
				var dependencies = path.get('arguments', '1', 'elements');
				var isAlreadyADependency = dependencies.value.some(function(dependency) {
					if (namedTypes.Literal.check(dependency) &&
						dependency.value == newDependency)
						return true;
				});

				if (!isAlreadyADependency)
					dependencies.push(astBuilders.literal(newDependency));

				return false;
			}
		}
	});

	var codeGenOptions = {
		quote: "single"
	};
	return recast.print(tree, codeGenOptions).code;
}

function withModuleNameMixin(classToExtend) {
	var oldInitialize = classToExtend.prototype._initialize;
	classToExtend.prototype._initialize = function() {
		if (oldInitialize)
			oldInitialize.apply(this, arguments);

		this.option('module', {
			desc: 'Specifies the module to create the angular component in.',
			alias: 'm',
			type: String
		});
	};

	classToExtend.prototype._determineModuleName = function() {
		// Priority of module name:
		// 1. Explicitly specified by --module or -m option
		// 2. Inferred from CWD if CWD is under src/app
		// 3. Taken from the generator's command line argument
		return this.options.module || this.options.m || getModuleNameFromCWD(this.destinationRoot()) || this.name;
	};

	classToExtend.prototype._getModuleContents = function(moduleName) {
		var moduleFiles = createModules(moduleName, this.destinationRoot());
		for (var file in moduleFiles) {
			if (this.fs.exists(this.destinationPath(file)))
				moduleFiles[file] = this.fs.read(this.destinationPath(file));
		}

		return moduleFiles;
	};
};

module.exports = {
	getModuleNameFromCWD: getModuleNameFromCWD,
	withModuleNameMixin: withModuleNameMixin,
	getModuleNamePropertiesFromModuleName: getModuleNamePropertiesFromModuleName,
	addModuleDependency: addModuleDependency
};
