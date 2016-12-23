/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function() {
  'use strict';

  angular
    .module('app.locator', ['psaf-locator']);

  angular.module('app').requires.push('app.locator');

})();
