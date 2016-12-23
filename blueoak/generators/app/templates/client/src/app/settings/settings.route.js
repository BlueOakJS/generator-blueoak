(function() {
    'use strict';

    angular
        .module('app.settings')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'app',
                url: '/settings',
                views: {
                    'primary-view@app': {
                        templateUrl: 'app/settings/settings.html'
                    }
                }
            });
    }
})();
