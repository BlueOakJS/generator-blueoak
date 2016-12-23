(function(){
    'use strict';

    angular
        .module('<%= moduleNameProperties.moduleName %>')
        .service('<%= serviceName %>', <%= serviceName %>);

    <%= serviceName %>.$inject = [];

    /**
     * @ngdoc service
     * @name <%= serviceName %>
     * @description
     * #
     */
    function <%= serviceName %>() {
    }
})();
