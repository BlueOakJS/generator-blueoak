/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var recast = require('recast');
var traverse = require('traverse');
var _ = require('lodash');
var generatorBaseClass = require('../../common/generatorBaseClass');
var angularModuleUtilities = require('../../common/angularModuleUtilities');
var fluentCall = require('../../common/fluent');

var rootDirectory = path.join(
						'client',
						'src',
						'app'
					);

function isFluentCallExpression(tree, name) {
	if (tree.callee.type != 'MemberExpression')
		return false;
	var memberExpressionObject = tree.callee.object;
	if (memberExpressionObject.type == 'CallExpression')
		return isFluentCallExpression(memberExpressionObject, name);
	return memberExpressionObject.type == 'Identifier' && memberExpressionObject.name == name;
}

function findFluentCall(tree, name) {
	var fluentCalls = [];
	var nodes = traverse(tree).forEach(function() {
		if (this.parent && this.parent.node.type == "ExpressionStatement" && this.node.type === 'CallExpression' && isFluentCallExpression(this.node, name))
			fluentCalls.push(this.parent.node);
	});
	return fluentCalls;
};

function findExpressionStatement(tree, name) {
	var expressionStatements = [];
	var nodes = traverse(tree).forEach(function() {
		if (this.node && this.node.type === 'BlockStatement' && this.node.body.length == 1 &&
			this.node.body[0].type == "ExpressionStatement" && this.node.body[0].expression.type == "Identifier" && this.node.body[0].expression.name == name)
			expressionStatements.push(this.node.body[0]);
	});
	return expressionStatements;
};


var moduleSubgeneratorClass = generatorBaseClass.extend(yeoman.generators.NamedBase, {
	_initialize: function() {
		this.option('uri', {
			desc: 'Allow a custom uri for routing',
			type: String,
			required: false
		});
	},

	default: function() {
		var moduleName = this._determineModuleName();
		this.moduleNameProperties = angularModuleUtilities.getModuleNamePropertiesFromModuleName(moduleName);

		this.viewFileName = _.kebabCase(this.name) + '.html';

		var moduleNameComponents = this.moduleNameProperties.moduleName.split('.');

		var moduleNameLastPart = moduleNameComponents[moduleNameComponents.length - 1];

		this.routeFileName = _.kebabCase(moduleNameLastPart) + '.route.js';

		this.controllerName = _.capitalize(_.camelCase(this.name)) + 'Controller';

		this.stateName = _.camelCase(this.name);

		var moduleFiles = this._getModuleContents(this.moduleNameProperties.moduleName);

		var moduleFilename = path.join(
			rootDirectory,
			this.moduleNameProperties.moduleDirectoryName,
			this.moduleNameProperties.moduleFileName
		);
		moduleFiles[moduleFilename] = angularModuleUtilities.addModuleDependency(moduleFiles[moduleFilename], 'ui.router');

		for (var file in moduleFiles) {
			this.fs.write(this.destinationPath(file), moduleFiles[file]);
		}

		this.composeWith('blueoak:view', {
			args: [
				this.name
			],
			options: {
				module: this.moduleNameProperties.moduleName
			}
		});

		this.composeWith('blueoak:controller', {
			args: [
				this.name
			],
			options: {
				module: this.moduleNameProperties.moduleName
			}
		});

		this.uri = this.name;
		if (this.options.uri)
			this.uri = this.options.uri;

		if (this.uri.substr(0, 1) != '/')
			this.uri = '/' + this.uri;

		var routePath = this.destinationPath(path.join(
			rootDirectory,
			this.moduleNameProperties.moduleDirectoryName,
			this.routeFileName)
		);

		// Read the existing route file.
		var routeFileContent;
		if (this.fs.exists(routePath)) {
			routeFileContent = this.fs.read(routePath).toString();
		} else {
			routeFileContent = this.fs.read(this.destinationPath(path.join(
				'client',
				'.templates',
				'emptyroute.js'
			))).toString();
      		routeFileContent = _.template(routeFileContent)(this);
		}

		var tree = recast.parse(routeFileContent);

		// Create the new route call to add
		var newcall = this.fs.read(this.destinationPath(path.join(
			'client',
			'.templates',
			'route.js'
			)
		));

		// Remove any newlines at the end of the file.
		while (newcall.lastIndexOf("\r") == newcall.length - 1 ||
				newcall.lastIndexOf("\n") == newcall.length - 1)
			newcall = newcall.slice(0, -1);

		newcall = _.template(newcall)(this);


		var stateProviderCalls = fluentCall(tree, "$stateProvider");

		if (stateProviderCalls.length) {
			var whichFluentCall;
			var stateFound = stateProviderCalls[0].some(function(stateCall, index) {
				if (stateCall.functionName() != "state")
					return false;
				var stateName = stateCall.arguments.nodes[0].elements[0];
				if (stateName.type == "Literal" && stateName.value == this.stateName) {
					whichFluentCall = index;
					return true;
				} else {
					return false;
				}
			}, this);

			if (stateFound)
				stateProviderCalls[0].getCallAt(whichFluentCall).replaceCall(newcall);
			else
				stateProviderCalls[0].appendCall(newcall);
		} else {
			var expressionStatements = findExpressionStatement(tree, "$stateProvider");
			if (expressionStatements.length) {
				var tree2 = recast.parse('$stateProvider' + newcall);
				expressionStatements[0].expression = tree2.program.body[0].expression;
			}
		}

		this.fs.write(
			routePath,
			recast.print(tree).code
		);
	}
});

angularModuleUtilities.withModuleNameMixin(moduleSubgeneratorClass);

module.exports = moduleSubgeneratorClass;
