(function(){
    'use strict';

    angular
        .module('app.layout')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', 'NavigationService'];

    /**
     * @ngdoc function
     * @name HeaderController
     * @description
     * #
     */
    function HeaderController($scope, NavigationService) {
        var vm = this;

        var destroyStateChangeListener = $scope.$on('$stateChangeSuccess', function (event, toState) {
            if (angular.isObject(toState.data)) {
                vm.showBackButton = !!toState.data.showBackButton;
            } else {
                vm.showBackButton = false;
            }
        });

        $scope.$on('$destroy', function () {
            destroyStateChangeListener();
        });

        vm.back = function () {
            NavigationService.goBack();
        };
    }
})();
