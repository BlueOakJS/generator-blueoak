(function(){
    'use strict';

    angular
        .module('app.layout')
        .controller('MainLayoutController', MainLayoutController);

    MainLayoutController.$inject = ['$scope', '$element', '$state'];

    /**
     * @ngdoc function
     * @name MainLayoutController
     * @description
     * #
     */
    function MainLayoutController($scope, $element, $state) {
        // var vm = this;
        var viewClassMap = {
            'header@app': 'has-header',
            'footer@app': 'has-footer'
        };

        var destroyStateChangeListener = $scope.$on('$stateChangeSuccess', function (event, toState) {
            updateLayoutStyles(toState);
        });

        // $stateChangeSuccess doesn't trigger on initial load, needs to be handled manually
        updateLayoutStyles($state.current);

        $scope.$on('$destroy', function () {
            destroyStateChangeListener();
        });

        function updateLayoutStyles(state) {
            angular.forEach(viewClassMap, function (className, viewName) {
                if (hasView(state, viewName)) {
                    $element.addClass(className);
                } else {
                    $element.removeClass(className);
                }
            });
        }

        function hasView(state, viewName) {
            // child views will use empty {} to override parent view
            if (angular.equals({}, state.views[viewName])) {
                return false;
            } else if (angular.isObject(state.views[viewName])) {
                return true;
            } else if (angular.isDefined(state.parent)) {
                // recursively go up the hierarchy
                return hasView($state.get(state.parent), viewName);
            } else {
                return false;
            }
        }
    }
})();
