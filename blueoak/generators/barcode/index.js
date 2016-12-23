/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var recast = require('recast');
var astTypes = require('ast-types');
var namedTypes = astTypes.namedTypes;
var addInjection = require('../../common/angularDependencyInjection').addInjection;
var constants = require('../../common/constants');
var procSpawn = require('superspawn').spawn;

var barcodeRootDirectory = path.join('client/src/app/barcode');

module.exports = yeoman.generators.Base.extend({
	default: function() {
		this.composeWith('blueoak:module', {
			args: [
				'app.barcode'
			]
		});

		this.composeWith('blueoak:controller', {
			args: [
				'barcode'
			],
			options: {
				'm': 'barcode'
			}
		});

		this.composeWith('blueoak:route', {
			args: [
				'barcode'
			],
			options: {
				'm': 'barcode'
			}
		});
	},

	_addCodeToControllerBody: function() {
		var controllerCode = this.fs.read(this.templatePath('barcode.controller.js'));
		var controllerCodeTree = recast.parse(controllerCode);

		var controllerFile = this.fs.read(this.destinationPath(path.join(barcodeRootDirectory, 'barcode.controller.js')));

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

				if (!isFunctionNamed('BarcodeController')) {
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
		this.fs.write(this.destinationPath(path.join(barcodeRootDirectory, 'barcode.controller.js')), recast.print(tree, codeGenOptions).code);
	},

	_addInjections: function() {
		var filename = path.join(barcodeRootDirectory, 'barcode.controller.js');
		var controllerFile = this.fs.read(filename);

		var result = addInjection(controllerFile, 'BarcodeController', '$scope');

		this.fs.write(this.destinationPath(filename), result);
	},

	writing: function() {
		var files = [
			'barcode.html'
		];

		files.forEach(function(file) {
			this.fs.copy(this.templatePath(file), this.destinationPath(path.join(barcodeRootDirectory, file)));
		}, this);

		this._addInjections();

		this._addCodeToControllerBody();
	},

	installCordovaPlugin: function () {
		var cordovaDir = path.join('client', this.config.get('cordovaDirectory'));
		console.log(cordovaDir);

		var appType = this.config.get('appType');
		if (appType == constants.appTypeChoices.cordova) {
			return procSpawn('cordova', ['plugin', 'add', 'phonegap-plugin-barcodescanner'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		} else if (appType == constants.appTypeChoices.mfp) {
			return procSpawn('mfp', ['cordova', 'plugin', 'add', 'phonegap-plugin-barcodescanner'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		}
	}
});
