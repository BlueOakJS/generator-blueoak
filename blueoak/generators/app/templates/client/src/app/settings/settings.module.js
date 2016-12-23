(function () {
    'use strict';

    angular.module('app.settings', ['ui.router']);
    angular.module('app').requires.push('app.settings');
}());
