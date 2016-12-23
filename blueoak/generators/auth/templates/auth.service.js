/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth').service('AuthService', AuthService);

  AuthService.$inject = [
    '$q',
    '$http',
    'GoogleAuthService',
    'SproutAuthService',
    'AUTH_STRATEGY',
    'AUTH_SIGN_OUT'
  ];

  function AuthService ($q, $http, GoogleAuthService, SproutAuthService, AUTH_STRATEGY,
                        AUTH_SIGN_OUT) {
    var self = this || {};

    var KNOWN_STRATEGIES = ['Sprout Server'],
        KNOWN_PROVIDERS = ['google'];

    self.provider;
    self.strategy;

    self.signIn = function (auth) {
      switch(auth.provider) {
        case 'google':
          return self.googleSignIn(auth);
        default:
          throw new Error('Unknown or undefined authentication provider. Verify the options ' +
                          'passed to sign in contain a "provider" property and its value is ' +
                          'set to one of the following: ' + KNOWN_PROVIDERS.toString());
      }
    };

    self.signOut = function () {
      switch(self.provider) {
        case 'google':
          return $http.get(AUTH_SIGN_OUT).then(self.googleSignOut);
      }
    };

    self.googleSignOut = function () {
      return GoogleAuthService.signOut();
    };

    self.googleSignIn = function (auth) {
      self.provider = 'google';

      switch(AUTH_STRATEGY) {
        case 'Sprout Server':
          return self.googleSignInWithSprout(auth);
        default:
          throw new Error('Unknown or undefined authentication strategy.  Verify that you have ' +
                          'created an Angular constant with the name AUTH_STRATEGY and have ' +
                          'assigned it one of the following values: ' +
                          KNOWN_STRATEGIES.toString());
      }
    };

    self.googleSignInWithSprout = function (auth) {
      self.strategy = 'Sprout Server';

      return $q(function (resolve, reject) {
        SproutAuthService.authenticateWithGoogle(auth).then(function () {
          resolve(auth);
        })
        .catch(function (error) {
          reject(error);
        });
      });
    };
  }
}());
