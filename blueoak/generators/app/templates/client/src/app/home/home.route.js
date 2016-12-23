(function() {
    'use strict';

    angular
        .module('app.home')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'app',
                url: '/',
                views: {
                    'primary-view@app': {
                        templateUrl: 'app/home/home.html'
                    }
                }
            });
    }
})();
