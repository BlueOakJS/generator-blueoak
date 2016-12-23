/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth', [])
    .constant('AUTH_SIGN_IN', '<%= authSignIn %>')
    .constant('AUTH_SIGN_OUT', '<%= authSignOut %>')
    .constant('AUTH_STRATEGY', '<%= authStrategy %>')
    .constant('GOOGLE_CLIENT_ID', '<%= authGoogleClientId %>');

  angular.module('app').requires.push('app.auth');
}());
