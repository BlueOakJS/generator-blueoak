/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth').directive('googleSignIn', googleSignIn);

  googleSignIn.$inject = ['GoogleAuthService', 'AuthService'];

  function googleSignIn (GoogleAuthService, AuthService) {

    function link (scope) {
      scope.signIn = signIn;

      function signIn () {
        GoogleAuthService.signIn()
          .then(AuthService.signIn)
          .then(signInSuccess)
          .catch(signInFailure);
      }

      function signInSuccess (authData) {
        if(scope.callback) {
          scope.callback(false, authData);
        }
      }

      function signInFailure (error) {
        if(scope.callback) {
          scope.callback(true, error);
        }
      }
    }

    return {
      link: link,
      restrict: 'E',
      template: '<ng-transclude ng-click="signIn()"></ng-transclude>',
      transclude: true,
      replace: true,
      scope: {
        callback: '='
      }
    };
  }
}());
