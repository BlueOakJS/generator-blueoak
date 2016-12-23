(function() {
    'use strict';

    angular
        .module('app.reports')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('reports', {
                parent: 'app',
                url: '/reports',
                views: {
                    'primary-view@app': {
                        templateUrl: 'app/reports/reports.html',
                        controller: 'ReportsController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('report-details', {
                parent: 'reports',
                url: '/:id',
                views: {
                    'primary-view@app': {
                        templateUrl: 'app/reports/report-details.html',
                        controller: 'ReportsController',
                        controllerAs: 'vm'
                    },
                    'footer@app': {} // override parent, will be hidden
                },
                data: {
                    showBackButton: true
                }
            });
    }
})();
