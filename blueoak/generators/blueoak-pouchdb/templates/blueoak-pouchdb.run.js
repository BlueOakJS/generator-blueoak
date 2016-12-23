/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

(function() {
    'use strict';

    angular
        .module('app.blueoakPouchdb')
        .run(appRun);

    appRun.$inject = [
        '$log',
        'PouchdbService'
    ];

    function appRun($log, PouchdbService) {
        PouchdbService.init();
    }
})();
