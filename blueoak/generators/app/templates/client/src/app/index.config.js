(function() {
    'use strict';

    angular
        .module('app')
        .config(config);

    config.$inject = [
        '$logProvider',
        '$urlRouterProvider'
    ];

    function config($logProvider, $urlRouterProvider) {
        // Enable log
        $logProvider.debugEnabled(true);

        // Don't start the router until we determine the first state.
        $urlRouterProvider.deferIntercept();
    }
})();
