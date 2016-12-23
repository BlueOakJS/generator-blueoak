/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

var generators = require('yeoman-generator'),
    cheerio = require('cheerio'),
    path = require('path'),
    chalk = require('chalk'),
    fs = require('fs');

var DOC_URL = 'https://github.com/PointSource/generator-sprout-client/wiki/sub-generator-auth';

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    var config = this.config.getAll();

    if(!config.props) {
      this.env.error(chalk.red('You don\'t have an existing Sprout-generated project in this ' +
                               'location!  Run `yo` to generate a Sprout project before ' +
                               'attempting to use a Sprout sub-generator.\n'));
    }
  },

  prompting: function () {
    var done = this.async(),
        config = this.config.getAll();

    var prompts = [
      {
        type: 'checkbox',
        name: 'authProvider',
        message: 'Which authorization provider(s) would you like?',
        choices: [
          {
            name: 'Google Sign In',
            checked: true
          }
        ]
      },
      {
        type: 'list',
        name: 'authStrategy',
        message: 'Which authorization strategy are you using?',
        choices: [
          'Sprout Server'
        ],
        default: 0,
        when: function () {
          return config.props.projectType !== 'Client-side Only';
        }
      },
      {
        type: 'list',
        name: 'authProtocol',
        message: 'What protocol is your authentication endpoint?',
        choices: [
          'http',
          'https'
        ],
        default: 0
      },
      {
        name: 'authHostname',
        message: 'What is your authentication endpoint\'s hostname (e.g. localhost, example.com)?',
        validate: function(input) {
          if(input.indexOf(':') !== -1) {
            return 'Do not include a port number';
          }

          return true;
        },
        default: config.props.authHostname ? config.props.authHostname : 'localhost'
      },
      {
        name: 'authPort',
        message: 'What port is listening for authentication requests? (e.g. 80, 3000, 1337)',
        validate: function(input) {
          if(!(/^[0-9]{0,65535}$/.test(input))) {
            return 'That is not a valid port.  Select a port ranging from 0 - 65535.';
          }

          return true;
        },
        default: function () {
          if(config.props.authPort) {
            return config.props.authPort;
          }

          if(config.props.nodePort) {
            return config.props.nodePort;
          }

          return 1337;
        }
      },

      {
        name: 'authGoogleClientId',
        message: 'What is your Google Client Id?',
        validate: function(input) {
          return true;
          var invalid = 'That does not appear to be a valid Google Client Id';

          try {
            var prefix = input.split('-')[0];
            var content = input.split('.')[0].split('-')[1];
            var suffix = input.split('-')[1].split('.').splice(1).join('.');
          } catch (error) {
            return invalid;
          }

          if(!(/^[0-9]{12}$/.test(prefix))) {
            return invalid;
          }

          if(!(/^[0-9a-z]{32}$/.test(content))) {
            return invalid;
          }

          if(!(/^[a-z.]{26}$/.test(suffix))) {
            return invalid;
          }

          return true;
        },
        when: function(answers) {
          return answers.authProvider.indexOf('Google Sign In') !== -1 &&
                 config.props.projectType !== 'Server-side Only';
        },
        default: config.props.authGoogleClientId ? config.props.authGoogleClientId : ''
      },
      {
        name: 'authGoogleClientSecret',
        message: 'What is your Google Client Secret?',
        validate: function(input) {
          return true;

          if(!(/^[a-zA-Z0-9_-]{24}$/.test(input))) {
            return 'That does not appear to be a valid Google Client Secret';
          } else {
            return true;
          }
        },
        when: function(answers) {
          return answers.authProvider.indexOf('Google Sign In') !== -1 &&
                 config.props.projectType !== 'Client-side Only';
        },
        default: config.props.authGoogleClientSecret ? config.props.authGoogleClientSecret : ''
      }
    ];

    this.prompt(prompts, function (answers) {
      this.props = answers;

      done();
    }.bind(this));
  },

  configuring: function () {
    var config = this.config.getAll();
    var props = this.props;

    for(var prop in props) {
      config.props[prop] = props[prop];
    }

    this.config.set('props', config.props);
  },

  writing: function () {
    var config = this.config.getAll();

    if(config.props.projectType !== 'Server-side Only') {
      this._injectDependencies();
      this._writeClientConfig();
      this._writeClient();
    }

    if(config.props.projectType !== 'Client-side Only') {
      this._writeServerConfig();
    }
  },

  end: function () {
    this.log(chalk.green.bold('\nYour authentication package has been generated!\n'));
    this.log(chalk.green('For documentation on how to use this package visit: \n'));
    this.log(chalk.green.underline(DOC_URL + '\n'));
  },

  _injectDependencies: function () {
    var index = fs.readFileSync('client/src/index.html'),
        script = '<script src="https://apis.google.com/js/platform.js"></script>';

    $ = cheerio.load(index);
    $('script[src="https://apis.google.com/js/platform.js"]').remove();
    $(script).insertAfter('[ui-view="root"]');

    fs.writeFileSync('client/src/index.html', $.html());
  },

  _writeClientConfig: function () {
    var configPath = path.join(this.destinationRoot(), 'client/.eslintrc'),
        config = JSON.parse(fs.readFileSync(configPath));

    config.globals.gapi = true;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },

  _writeServerConfig: function () {
    var configPath = path.join(this.destinationRoot(), 'server/config/default.json'),
        config = JSON.parse(fs.readFileSync(configPath));

    if(this.props.authProvider[0] === 'Google Sign In') {
      config.auth = {};
      config.auth.provider = this.props.authProvider[0];
    }

    if(config.express.middleware.indexOf('session') === -1) {
      config.express.middleware.push('session');
    }

    if(config.express.middleware.indexOf('cors') === -1) {
      config.express.middleware.push('cors');
    }

    if(!config.session) {
      config.session = {
        keys: ['sessionkey']
      };
    }

    config['google-oauth'] = {};

    config['google-oauth'].callbackPath = '/auth';
    config['google-oauth'].clientSecret = this.props.authGoogleClientSecret;
    config['google-oauth'].clientId = this.props.authGoogleClientId;
    config['google-oauth'].profile = true;
    config['google-oauth'].redirectURI = 'postmessage';
    config['google-oauth'].signoutPath = '/sign-out';

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },

  _writeClient: function () {
    var config = this.config.getAll(),
        port = config.props.nodePort,
        uri = this.props.authProtocol + '://' + this.props.authHostname + ':' + port,
        src = this.templatePath(),
        dest = this.destinationPath('client/src/app/auth');

    this.fs.copyTpl(
      src + '/auth.module.js',
      dest + '/auth.module.js',
      {
        authSignIn: uri + '/auth',
        authSignOut: uri + '/sign-out',
        authStrategy: this.props.authStrategy,
        authGoogleClientId: this.props.authGoogleClientId
      }
    );

    this.fs.copy(src + '/auth.service.js', dest + '/auth.service.js');

    if(this.props.authProvider.indexOf('Google Sign In') !== -1) {
      this.fs.copy(src + '/googleAuth.service.js', dest + '/googleAuth.service.js');
      this.fs.copy(src + '/googleSignIn.directive.js', dest + '/googleSignIn.directive.js');
      this.fs.copy(src + '/googleSignOut.directive.js', dest + '/googleSignOut.directive.js');
    }

    if(this.props.authStrategy === 'Sprout Server') {
      this.fs.copy(src + '/sproutAuth.service.js', dest + '/sproutAuth.service.js');
    }
  }

});

