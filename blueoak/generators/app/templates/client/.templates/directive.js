(function(){
    'use strict';

    angular
        .module('<%= moduleNameProperties.moduleName %>')
        .directive('<%= directiveName %>', <%= directiveFunctionName %>);

    <%= directiveFunctionName %>.$inject = [];

    /**
     * @ngdoc directive
     * @name <%= directiveName %>
     * @description
     * #
     */
    function <%= directiveFunctionName %>() {
        return {
            template: '<div></div>',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                element.text('this is the <%= directiveName %> directive');
            }
        };
    }
})();
