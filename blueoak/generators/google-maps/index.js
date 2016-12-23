/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var recast = require('recast');
var astTypes = require('ast-types');
var astBuilders = astTypes.builders;
var namedTypes = astTypes.namedTypes;
var addInjection = require('../../common/angularDependencyInjection').addInjection;
var angularModuleUtilities = require('../../common/angularModuleUtilities');

var mapRootDirectory = path.join(
							'client',
							'src',
							'app',
							'map'
						);

module.exports = yeoman.generators.Base.extend({
	default: function() {
		this.composeWith('blueoak:module', {
			args: [
				'app.map'
			]
		});

		this.composeWith('blueoak:controller', {
			args: [
				'map'
			],
			options: {
				'm': 'map'
			}
		});

		this.composeWith('blueoak:route', {
			args: [
				'map'
			],
			options: {
				'm': 'map'
			}
		});
	},

	_addOnExitToState: function() {
		var routeFile = this.fs.read(this.destinationPath(path.join(mapRootDirectory, 'map.route.js')));

		var tree = recast.parse(routeFile);

		astTypes.visit(tree, {
			visitCallExpression: function(path) {
				function isMapStateRegistrationCall(path) {
					var member1 = path.get("callee");
					if (!namedTypes.MemberExpression.check(member1.value))
						return false;
					var member1PropertyNode = member1.get("property").value;
					if (!namedTypes.Identifier.check(member1PropertyNode) ||
						member1PropertyNode.name != 'state')
						return false;

					var member2 = path.get("callee", "object").value;
					if (!namedTypes.Identifier.check(member2) ||
						member2.name != '$stateProvider')
						return false;

					if (!namedTypes.Literal.check(path.get('arguments', '0').value) ||
						path.get('arguments', '0').value.value != 'map')
						return false;

					return true;
				}

				if (!isMapStateRegistrationCall(path)) {
					// If it's not the right call, keep looking
					this.traverse(path);
				} else {
					// Found it.. add onExit to the hash
					var newfunc = recast.parse("['snapRemote', function(snapRemote) {\n" +
"    // re-enable angular-snap - it was disabled so users can drag map w/o triggering angular-snap\n" +
"    snapRemote.enable();\n" +
"}];");
					var onExitValue = newfunc.program.body[0].expression;

					var arg2 = path.get('arguments', '1');
					if (!namedTypes.ObjectExpression.check(arg2.value))
						return true;
					var onExitProperty;
					var foundOnExitProperty = arg2.value.properties.some(function(prop) {
						if (namedTypes.Identifier.check(prop.key) && prop.key.name == "onExit") {
							onExitProperty = prop;
							return true;
						}
						return false;
					});

					if (foundOnExitProperty) {
						onExitProperty.value = onExitValue;
					} else {
						arg2.value.properties.push(astBuilders.property("init", astBuilders.identifier('onExit'), onExitValue));
					}
					return false;
				}
			}
		});

		var codeGenOptions = {
			quote: "single",
			lineBreaksInObjects: false
		};
		this.fs.write(this.destinationPath(path.join(mapRootDirectory, 'map.route.js')), recast.print(tree, codeGenOptions).code);
	},

	_addCodeToControllerBody: function() {
		var controllerCode = this.fs.read(this.templatePath('map.controller.js'));
		var controllerCodeTree = recast.parse(controllerCode);

		var controllerFile = this.fs.read(this.destinationPath(path.join(mapRootDirectory, 'map.controller.js')));

		var tree = recast.parse(controllerFile);

		astTypes.visit(tree, {
			visitFunctionDeclaration: function(path) {
				function isFunctionNamed(functionName) {
					var functionId = path.get("id").value;
					if (!namedTypes.Identifier.check(functionId) ||
						functionId.name != functionName)
						return false;

					return true;
				}

				if (!isFunctionNamed('MapController')) {
					// If it's not the right call, keep looking
					this.traverse(path);
				} else {
					// Found it.. add the statements to the end of the function
					var functionStatements = path.get('body', 'body');
 					controllerCodeTree.program.body.forEach(function(line) {
						functionStatements.push(line);
					});

					return false;
				}
			}
		});

		var codeGenOptions = {
			quote: "single"
		};
		this.fs.write(this.destinationPath(path.join(mapRootDirectory, 'map.controller.js')), recast.print(tree, codeGenOptions).code);
	},

	_addAngularGoogleMapsModuleDependency: function() {
		var filename = path.join(mapRootDirectory, 'map.module.js');
		var moduleFile = this.fs.read(filename);

		var result = angularModuleUtilities.addModuleDependency(moduleFile, 'uiGmapgoogle-maps');

		this.fs.write(this.destinationPath(filename), result);
	},

	_addSnapRemoteInjectionToController: function() {
		var filename = path.join(mapRootDirectory, 'map.controller.js');
		var controllerFile = this.fs.read(filename);

		var result = addInjection(controllerFile, 'MapController', 'snapRemote');

		this.fs.write(this.destinationPath(filename), result);
	},

	writing: function() {
		var files = [
			'map.html',
			'map.scss'
		];

		files.forEach(function(file) {
			this.fs.copy(this.templatePath(file), this.destinationPath(path.join(mapRootDirectory, file)));
		}, this);

		this._addAngularGoogleMapsModuleDependency();

		this._addOnExitToState();

		this._addSnapRemoteInjectionToController();

		this._addCodeToControllerBody();
	},

	installingGoogleMaps: function () {
		this.bowerInstall(['angular-google-maps#2.1.6'], {
			save: true,
			cwd: './client'
		});
	},

	addGoogleMapToGulp: function () {
		var bowerJSON = this.fs.readJSON(this.destinationPath(path.join('client', 'bower.json')));
		if (bowerJSON.overrides == undefined)
			bowerJSON.overrides = {};
		bowerJSON.overrides['angular-google-maps'] = {
			main: [
				'dist/angular-google-maps.min.js'
			]
		};
		this.fs.writeJSON(this.destinationPath(path.join('client', 'bower.json')), bowerJSON);
	}
});
