(function () {
    'use strict';

    angular.module('app.common', []);
    angular.module('app').requires.push('app.common');
}());
