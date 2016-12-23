(function(){
    'use strict';

    angular
        .module('<%= moduleNameProperties.moduleName %>')
        .controller('<%= controllerName %>', <%= controllerName %>);

    <%= controllerName %>.$inject = [];

    /**
     * @ngdoc function
     * @name <%= controllerName %>
     * @description
     * #
     */
    function <%= controllerName %>() {
        var vm = this;

    }
})();
