(function() {
    'use strict';

    angular
        .module('<%= moduleNameProperties.moduleName %>')
        .config(routeConfig);

    routeConfig.$inject = [
        '$stateProvider'
    ];

    function routeConfig($stateProvider) {
        $stateProvider;
    }
})();
