/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth').service('SproutAuthService', SproutAuthService);

  SproutAuthService.$inject = ['$http', 'GOOGLE_CLIENT_ID', 'AUTH_SIGN_IN'];

  function SproutAuthService ($http, GOOGLE_CLIENT_ID, AUTH_SIGN_IN) {
    var self = this || {};

    self.authenticateWithGoogle = function (auth) {
      var config = {
        params: {
          code: auth.code
        }
      };

      return $http.get(AUTH_SIGN_IN, config);
    };
  }
}());
