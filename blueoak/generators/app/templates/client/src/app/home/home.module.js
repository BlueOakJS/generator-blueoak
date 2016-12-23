(function () {
    'use strict';

    angular.module('app.home', ['ui.router']);
    angular.module('app').requires.push('app.home');
}());
