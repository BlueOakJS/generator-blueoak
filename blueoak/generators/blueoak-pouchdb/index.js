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
var constants = require('../../common/constants');
var procSpawn = require('superspawn').spawn;


var moduleName = 'blueoak-pouchdb';

var moduleRootDirectory = path.join(
							'client',
							'src',
							'app',
							moduleName
						);

module.exports = yeoman.generators.Base.extend({
	default: function() {
		this.composeWith('blueoak:module', {
			args: [
				'app.' + moduleName
			]
		});

		this.composeWith('blueoak:controller', {
			args: [
				moduleName
			],
			options: {
				'm': moduleName
			}
		});

		// this.composeWith('blueoak:route', {
		// 	args: [
		// 		moduleName
		// 	],
		// 	options: {
		// 		'm': moduleName
		// 	}
		// });

		this.composeWith('blueoak:service', {
			args: [
				'NetworkStatusService'
			],
			options: {
				'm': moduleName
			}
		});

		this.composeWith('blueoak:service', {
 			args: [
 				'PouchdbService'
 			],
 			options: {
 				'm': moduleName
 			}
 		});
	},

	prompting: function () {
    	var done = this.async(),
        	config = this.config.getAll();

    	var appConfigPath = this.destinationPath(path.join('client', 'src', 'app.config.json'));
		var appConfig = this.fs.readJSON(appConfigPath);
		var moduleConfig;
		var existingLocalDbName, existingRemoteDbName, existingRemoteDbURL, existingRemoteDbUsername, existingRemoteDbPassword = '';

		if(appConfig && appConfig.local && appConfig.local.blueoak_pouchdb){
			moduleConfig = appConfig.local.blueoak_pouchdb;
			if (moduleConfig.localDb.dbname){
				existingLocalDbName = moduleConfig.localDb.dbname;
			};

			if (moduleConfig.remoteDb){
				if (moduleConfig.remoteDb.dbname){
					existingRemoteDbName = moduleConfig.remoteDb.dbname;
				};

				if (moduleConfig.remoteDb.url){
					existingRemoteDbURL = moduleConfig.remoteDb.url;
				};

				if (moduleConfig.remoteDb.pouchDbOptions && moduleConfig.remoteDb.pouchDbOptions.auth){
					existingRemoteDbUsername = moduleConfig.remoteDb.pouchDbOptions.auth.username;
					existingRemoteDbPassword = moduleConfig.remoteDb.pouchDbOptions.auth.password;
				};
			}
		};

        var projName = config.projectName;
        if (existingLocalDbName.length > 0){
        	projName = existingLocalDbName;
        } else {
	        if (projName){
	        	projName = projName.replace(/ /g, '_').toLowerCase();
	        };
        };


	    var prompts = [{
	        name: 'localDbName',
	        message: 'Local database name',
	        validate: function(input){
	        	if (input.length < 1){
	        		return 'Please provide a unique local database name:';
	        	} else {
	        		return true;
	        	};
	        },
   	        default: projName
	    	},
	    	{
	    		name: 'remoteDbName',
	    		message: 'Remote database name (optional):',
	    		default: existingRemoteDbName
	    	},
	    	{
	    		name: 'remoteDbURL',
	    		message: 'Remote database URL (optional):',
	    		default: existingRemoteDbURL
	    	},
	    	{
	    		name: 'remoteDbUsername',
	    		message: 'Remote database authentication username (optional):',
	    		default: existingRemoteDbUsername
	    	},
	    	{
	    		name: 'remoteDbPassword',
	    		message: 'Remote database authentication password (optional):',
	    		default: existingRemoteDbPassword
	    	}
	    ];

    	this.prompt(prompts, function (answers) {
      		this.props = answers;
      		var localDbName = answers.localDbName.replace(/ /g, '_').toLowerCase();
      		var remoteDbName = answers.remoteDbName.replace(/ /g, '_').toLowerCase();

    		var pouchdbConfig = {
			    "localDb": {
			        "dbname": localDbName,
			        "pouchDbOptions":{
			          "revs_limit": 1,
			          "auto_compaction": true
			        }
			    },
			    "remoteDb": {
			        "url": answers.remoteDbURL,
			        "dbname": remoteDbName,
			        "pouchDbOptions":{
			          "auth":{
			            "username": answers.remoteDbUsername,
			            "password": answers.remoteDbPassword
			    	    }
			      	}
			    },
			    "replicationOptions": {
			    },
	            "defaultDataSyncSettings": {
			        "syncOverWifiOnly": false,
        			"pull": true,
        			"push": true
      			}
    		};

			if (appConfig && appConfig.local){
				appConfig.local.blueoak_pouchdb = pouchdbConfig;
				this.fs.writeJSON(appConfigPath, appConfig);
			};

      		done();
    	}.bind(this));
    },

	_addCodeToControllerBody: function() {
		var controllerCode = this.fs.read(this.templatePath(moduleName + '.controller.js'));
		var controllerCodeTree = recast.parse(controllerCode);

		var controllerFile = this.fs.read(this.destinationPath(path.join(moduleRootDirectory, moduleName + '.controller.js')));

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

				if (!isFunctionNamed('BlueoakPouchdbController')) {
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
		this.fs.write(this.destinationPath(path.join(moduleRootDirectory, moduleName + '.controller.js')), recast.print(tree, codeGenOptions).code);
	},


	_addModuleDependency: function() {
		var filename = path.join(moduleRootDirectory, moduleName + '.module.js');
		var moduleFile = this.fs.read(filename);

		var result = moduleFile;
		result = angularModuleUtilities.addModuleDependency(result, 'app.config');
		result = angularModuleUtilities.addModuleDependency(result, 'ngCordova');

		this.fs.write(this.destinationPath(filename), result);
	},

	_addInjectionToController: function() {
		console.log('Controller injections...');
		var filename = path.join(moduleRootDirectory, moduleName + '.controller.js');
		var controllerFile = this.fs.read(filename);

		var injections = ['$log', '$rootScope', '$q', 'PouchdbService', 'NetworkStatusService'];
		var result = controllerFile;

		injections.forEach(function(injection){
			result = addInjection(result, 'BlueoakPouchdbController', injection);
		});

		this.fs.write(this.destinationPath(filename), result);
	},


	_addInjectionToService: function(serviceFilename, serviceFunction, injections) {
		console.log('Service injections...');
		var filename = path.join(moduleRootDirectory, serviceFilename);
		var serviceFile = this.fs.read(filename);

		var result = serviceFile;

		injections.forEach(function(injection){
			result = addInjection(result, serviceFunction, injection);
		});

		this.fs.write(this.destinationPath(filename), result);
	},

	_addCodeToServiceBody: function(serviceFilename, serviceFunctionName){
		// Service filename should be the same in Template and Destination
		var serviceTemplateCode = this.fs.read(this.templatePath(serviceFilename));
		var serviceCodeTree = recast.parse(serviceTemplateCode);
		// var serviceFile = this.fs.read(this.destinationPath(path.join(moduleRootDirectory, serviceFilename)));
		var serviceFile = this.fs.read(path.join(moduleRootDirectory, serviceFilename));

		var tree = recast.parse(serviceFile);

		astTypes.visit(tree, {
			visitFunctionDeclaration: function(path) {
				function isFunctionNamed(functionName) {
					var functionId = path.get("id").value;
					if (!namedTypes.Identifier.check(functionId) || functionId.name != functionName)
						return false;

					return true;
				};

				if (!isFunctionNamed(serviceFunctionName)) {
					// If it's not the right call, keep looking
					this.traverse(path);
				} else {
					// Found it.. add the statements to the end of the function
					var functionStatements = path.get('body', 'body');
 					serviceCodeTree.program.body.forEach(function(line) {
						functionStatements.push(line);
					});

					return false;
				}
			}
		});

		var codeGenOptions = {
			quote: "single"
		};
		this.fs.write(this.destinationPath(path.join(moduleRootDirectory, serviceFilename)), recast.print(tree, codeGenOptions).code);
	},


	writing: function() {
		var files = [
			'blueoak-pouchdb.html',
			'blueoak-pouchdb.route.js',
			'blueoak-pouchdb.run.js'
		];

		files.forEach(function(file) {
			this.fs.copy(this.templatePath(file), this.destinationPath(path.join(moduleRootDirectory, file)));
		}, this);


		this._addModuleDependency();
		this._addInjectionToController();
		this._addCodeToControllerBody();
		this._addInjectionToService('pouchdb.service.js', 'PouchdbService', ['$log', 'appConfig', '$q', 'NetworkStatusService', '$rootScope']);
		this._addInjectionToService('network-status.service.js', 'NetworkStatusService', ['$log', '$cordovaNetwork', '$window']);

		this._addCodeToServiceBody('pouchdb.service.js', 'PouchdbService');
		this._addCodeToServiceBody('network-status.service.js', 'NetworkStatusService');
	},

	installingModuleDependencies: function () {
		this.bowerInstall(['pouchdb#^6.x'], {
			save: true,
			cwd: './client'
		});
	},

	installCordovaPlugin: function () {
		var cordovaDir = path.join('client', this.config.get('cordovaDirectory'));
		console.log(cordovaDir);

		var appType = this.config.get('appType');
		if (appType == constants.appTypeChoices.cordova) {
			return procSpawn('cordova', ['plugin', 'add', 'cordova-plugin-network-information'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		} else if (appType == constants.appTypeChoices.mfp) {
			return procSpawn('mfp', ['cordova', 'plugin', 'add', 'cordova-plugin-network-information'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		}
	}


});
