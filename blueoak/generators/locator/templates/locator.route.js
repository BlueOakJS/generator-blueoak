/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function() {
  'use strict';

  angular
    .module('app.locator')
    .config(routerConfig);

  routerConfig.$inject = [
    '$stateProvider'
  ];

  function routerConfig($stateProvider) {
    $stateProvider
      .state('locator', {
        parent: 'app',
        url: '/locator',
        views: {
          'primary-view@app': {
            templateUrl: 'app/locator/locator.html',
            controller: 'LocatorController',
            controllerAs: 'vm'
          }
        }
      });
  }
})();
