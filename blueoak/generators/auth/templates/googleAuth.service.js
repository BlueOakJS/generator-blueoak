/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function () {
  'use strict';

  angular.module('app.auth').service('GoogleAuthService', GoogleAuthService);

  GoogleAuthService.$inject = ['$q', 'GOOGLE_CLIENT_ID'];

  function GoogleAuthService ($q, GOOGLE_CLIENT_ID) {
    var self = this || {};

    self.instance;
    self.user;
    self.auth;

    self.getInstance = function () {
      return $q(function (resolve, reject) {
        if(self.instance) {
          return resolve({
            instance: self.instance
          });
        }

        if(!gapi) {
          return reject();
        }

        gapi.load('auth2', function () {
          gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            cookiepolicy: 'single_host_origin'
          });

          self.instance = gapi.auth2.getAuthInstance();

          return resolve({
            instance: self.instance
          });
        });
      });
    };

    self.getUser = function () {
      if(!self.instance) {
        throw new Error('Must call getInstance() and signIn() before getUser()');
      }

      if(self.user) {
        return self.user;
      }

      var user = self.instance.currentUser.get().getBasicProfile();

      self.user = {
        id: user.getId(),
        name: user.getName(),
        imageUrl: user.getImageUrl(),
        email: user.getEmail()
      };

      return self.user;
    };

    self.getAuth = function () {
      if(!self.user) {
        throw new Error('Must call getInstance() and signIn() before getAuth()');
      }

      if(self.auth) {
        return self.auth;
      }

      var auth = self.instance.currentUser.get().getAuthResponse();
      var scope = self.instance.currentUser.get().getGrantedScopes();

      self.auth = {
        idToken: auth.id_token,
        loginHint: auth.login_hint,
        scope: scope,
        expiresIn: auth.expires_in,
        firstIssuedAt: auth.first_issued_at,
        expiresAt: auth.expires_at
      };

      return self.auth;
    };

    self.instanceSignIn = function () {
      return self.instance.signIn();
    };

    self.signIn = function () {
      return $q(function (resolve, reject) {
        self.getInstance()
          .then(self.instanceSignIn)
          .then(self.getUser)
          .then(self.getAuth)
          .then(self.grantOfflineAccess)
          .then(function (auth) {
            resolve({
              provider: 'google',
              user: self.user,
              auth: self.auth,
              code: auth.code
            });
          })
          .catch(function () {
            reject('Unable to authenticate the Google User');
          });
      });
    };

    self.signOut = function () {
      return self.instance.signOut();
    };

    self.grantOfflineAccess = function () {
      return self.instance.grantOfflineAccess({
        scope: self.auth.scope
      });
    };
  }
}());
