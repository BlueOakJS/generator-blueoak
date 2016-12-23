(function () {
    'use strict';

    angular.module('app.layout', ['ui.router']);
    angular.module('app').requires.push('app.layout');
}());
