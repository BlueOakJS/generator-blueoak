(function() {
    'use strict';

    angular
        .module('app')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                views: {
                    'root@': {
                        templateUrl: 'app/layout/layout.html'
                    }
                }
            });
    }
})();
