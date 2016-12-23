/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var spawn = require('superspawn').spawn;
var chalk = require('chalk');

var createAndroidKeystore = yeoman.generators.Base.extend({
	prompting: function() {
		if (!this.config.get('isCordovaAndroid')) {
			this.log(chalk.red.bold("ERROR: The Android platform has not been added to this project"));
			this.env.error("ERROR: The Android platform has not been added to this project");
		}

		var done = this.async();

		this.prompt([
			{
				name: 'androidkeystorename',
				message: 'What filename would you like to use for the Android keystore?',
				default: 'android.keystore'
			},
			{
				name: 'androidkeyaliasname',
				message: 'What alias name would you like to use for the Android key?',
				default: 'android'
			}
		], function(answers) {
			_.merge(this, answers);
			this.config.set({
				androidkeystorename: answers.androidkeystorename,
				androidkeyaliasname: answers.androidkeyaliasname
			});
			done();
		}.bind(this));
	},

	default: function() {
		var androidPlatformDir = path.join(
									this.destinationRoot(),
									'client',
									this.config.get('cordovaDirectory'),
									'platforms',
									'android'
								);

 		var check_reqs = require(path.join(
 							androidPlatformDir,
							'cordova',
							'lib',
							'check_reqs'
						));

		// Gotta run this generator async, because check_reqs works that way
		var done = this.async();

		check_reqs.check_java().then(
			function() {
				return spawn('keytool', ['-genkey', '-v', '-keystore', path.join(androidPlatformDir, this.androidkeystorename),
											'-alias', this.androidkeyaliasname, '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000'], {
					printCommand: true,
					stdio: 'inherit'
				});
			}.bind(this)
		).then(
			function() {
				done();
			},

			function(err) {
				this.log(chalk.red.bold("Couldn't create Android key: " + err));
				this.env.error("Couldn't create Android key: " + err);
				done();
			}.bind(this)
		);
	}
});

module.exports = createAndroidKeystore;
