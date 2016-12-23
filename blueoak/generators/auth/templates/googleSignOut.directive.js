/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth').directive('googleSignOut', googleSignOut);

  googleSignOut.$inject = ['AuthService'];

  function googleSignOut (AuthService) {

    function link (scope) {
      scope.signOut = signOut;

      function signOut () {
        AuthService.signOut()
          .then(signOutSuccess)
          .catch(signOutFailure);
      }

      function signOutSuccess (status) {
        if(scope.callback) {
          scope.callback(false, status);
        }
      }

      function signOutFailure (error) {
        if(scope.callback) {
          scope.callback(true, error);
        }
      }
    }

    return {
      link: link,
      restrict: 'E',
      template: '<ng-transclude ng-click="signOut()"></ng-transclude>',
      transclude: true,
      replace: true,
      scope: {
        callback: '='
      }
    };
  }
}());
