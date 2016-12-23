/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function() {
    'use strict';

    angular
        .module('app.blueoakPouchdb')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('blueoakPouchdb', {
                parent: 'app',
                url: '/blueoak-pouchdb',
                views: {
                    'primary-view@app': {
                        templateUrl: 'app/blueoak-pouchdb/blueoak-pouchdb.html',
                        controller: 'BlueoakPouchdbController',
                        controllerAs: 'vm',
                        resolve: {
                            'PouchdbService': function(PouchdbService){
                                return PouchdbService.init();
                            }
                        }
                    }
                }
            });
    }
})();
