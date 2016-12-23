(function () {
    'use strict';

    angular
        .module('app.common')
        .service('NavigationService', NavigationService);

    NavigationService.$inject = ['$rootElement', '$rootScope', '$window', '$state', '$timeout'];

    function NavigationService($rootElement, $rootScope, $window, $state, $timeout) {
        var backState = null,
            backStateParams = null;

        this.setBackState = function (newBackState, newBackStateParams) {
            backState = newBackState;
            backStateParams = newBackStateParams;
        };

        this.goBack = function () {
            $rootElement.addClass('reverse');
            if (backState) {
                $state.go(backState, backStateParams);
            } else {
                $window.history.back();
            }
        };

        var destroyStateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
            backState = null;
            backStateParams = null;

            $timeout(function () {
                $rootElement.removeClass('reverse');
            }, 500);
        });

        $rootScope.$on('$destroy', function () {
            destroyStateChangeListener();
        });
    }
}());
