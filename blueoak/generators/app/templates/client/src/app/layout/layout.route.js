(function() {
    'use strict';

    angular
        .module('app.layout')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider',
        '$urlRouterProvider'
    ];

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                parent: 'root',
                url: '',
                abstract: true,
                views: {
                    'left-menu@root': {
                        templateUrl: 'app/layout/side-menu/side-menu.html'
                    },
                    'content@root': {
                        templateUrl: 'app/layout/main.html',
                        controller: 'MainLayoutController',
                        controllerAs: 'vm'
                    },
                    'header@app': {
                        templateUrl: 'app/layout/header/header.html',
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    'footer@app': {
                        templateUrl: 'app/layout/footer/footer.html'
                    }
                }
            })

            .state('sample-full-screen', {
                parent: 'app',
                url: '/full-screen',
                views: {
                    'primary-view@app': {
                        template: '<div>Full Screen</div><a ui-sref="home">Back to home</a>'
                    },
                    'header@app': {},
                    'footer@app': {}
                }
            })

            .state('sample-no-header', {
                parent: 'app',
                url: '/no-header',
                views: {
                    'primary-view@app': {
                        template: '<div>No Header</div><a ui-sref="home">Back to home</a>'
                    },
                    'header@app': {}
                }
            })

            .state('sample-no-footer', {
                parent: 'app',
                url: '/no-footer',
                views: {
                    'primary-view@app': {
                        template: '<div>No Footer</div><a ui-sref="home">Back to home</a>'
                    },
                    'footer@app': {}
                }
            });

        $urlRouterProvider.otherwise('/');
    }
})();
