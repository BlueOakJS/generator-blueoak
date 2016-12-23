(function(){
    'use strict';

    angular
        .module('<%= moduleNameProperties.moduleName %>')
        .config('<%= decoratorName %>', <%= decoratorName %>);

    <%= decoratorName %>.$inject = ['$provide'];

    /**
     * @ngdoc function
     * @name <%= decoratorName %>
     * @description
     * #
     */
    function <%= decoratorName %>($provide) {
        $provide.decorator('<%= serviceName %>', function($delegate) {
            // decorate the $delegate
            return $delegate;
        });
    }
})();
